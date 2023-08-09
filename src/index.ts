import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { makeSearch } from "./search";
import type { Document } from "./search.types";

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
  zValidator(
    "query",
    z.object({
      page: z.string().optional().default("1"),
      size: z.string().optional().default("15"),
      proxy: z.string().optional().default("false"),
    })
  ),
  zValidator("json", z.object({
    page: z.number().optional().default(1),
    hasNext: z.boolean().optional().default(false),
    items: z.array(z.object({
      address_name: z.string(),
      category_group_code: z.string(),
      category_group_name: z.string(),
      category_name: z.string(),
      distance: z.string(),
      id: z.string(),
      phone: z.string(),
      place_name: z.string(),
      place_url: z.string(),
      road_address_name: z.string(),
      x: z.string(),
      y: z.string(),
    })).default([]),
  })),
  async (c) => {
    if (!c.env.KAKAO_REST_API_KEY) {
      return c.json({ error: "KAKAO_REST_API_KEY is required" }, 500);
    }

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
      console.log(
        `Query ${size} results from page ${page} for "${queryKeyword}"`
      );

      for await (const item of search({ keyword: queryKeyword, offset })) {
        items.push(item);
        if (items.length === size + 1) {
          break;
        }
      }

      return c.jsonT({
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
