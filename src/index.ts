import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { zValidator } from "@hono/zod-validator";
import { makeSearch } from "./search";
import { schemaQuery } from "./schema";
import { validateKakoKey } from "./middleware";

import type { Document } from "./types";

type BindingsType = {
  INDEX: KVNamespace;
  KAKAO_REST_API_KEY: string;
};

type Env = {
  Bindings: BindingsType;
};

const app = new Hono<Env>();

app.use("*", logger());

app.use("/api/v1/*", cors());

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
      const queryKeyword = keyword.replaceAll(" ", "");

      for await (const item of search({ keyword: queryKeyword, offset })) {
        items.push(item);
        if (items.length === size + 1) {
          break;
        }
      }

      return c.json({
        page,
        hasNext: items.length > size,
        items: items.slice(0, size),
      });
    } catch (error) {
      return c.json(error, 500);
    }
  }
);

export default app;
