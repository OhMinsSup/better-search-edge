import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import { makeSearch } from "./search";
import { schemaQuery } from "./schema";
import { validateKakoKey } from "./middleware";
import { HTTPException } from "hono/http-exception";

import type { Document } from "./types";

type BindingsType = {
  INDEX: KVNamespace;
  ENVIRONMENT: "development" | "production";
  KAKAO_REST_API_KEY: string;
};

type Env = {
  Bindings: BindingsType;
};

const app = new Hono<Env>();

app.use("*", logger());

app.use("/api/v1/*", (c, next) =>
  cors({
    origin: (origin) => {
      if (!origin) {
        return null;
      }
      const allowedHosts = [];
      if (c.env.ENVIRONMENT === "development") {
        allowedHosts.push(/^http:\/\/localhost/);
      }
      const valid = allowedHosts.some((regex) => regex.test(origin));
      if (valid) {
        return origin;
      }
      return null;
    },
  })(c, next)
);

app.get(
  "/api/v1/local/search/:keyword",
  validateKakoKey(),
  zValidator("query", schemaQuery),
  async (c) => {
    const keyword = decodeURIComponent(c.req.param("keyword"));
    const query = c.req.valid("query");

    const page = parseInt(query.page);
    const size = parseInt(query.size);
    const proxy = query.proxy === "true";
    const cacheFirst = !proxy;

    const search = makeSearch({
      apiKey: c.env.KAKAO_REST_API_KEY,
      namespace: c.env.INDEX,
      cacheFirst,
    });

    try {
      const items: Document[] = [];
      const offset = (page - 1) * size;
      const queryKeyword = keyword.trim();

      for await (const item of search({ keyword: queryKeyword, offset })) {
        items.push(item);
        if (items.length === size + 1) {
          break;
        }
      }

      return c.json({
        oK: true,
        result: {
          page,
          hasNext: items.length > size,
          items: items.slice(0, size),
        },
        error: null,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        const response = error.getResponse();
        return c.json(
          {
            ok: false,
            result: null,
            error: await response.json(),
          },
          response.status
        );
      }
      return c.json(
        {
          ok: false,
          result: null,
          error: null,
        },
        500
      );
    }
  }
);

export default app;
