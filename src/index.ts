import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { makeSearch } from "./search";
import type { Document } from "./search.types";

type Bindings = {
  INDEX: KVNamespace;
  KAKAO_REST_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", logger());

app.use("/api/v1/*", cors());

app.get("/api/v1/local/search/:keyword", async (c) => {
  if (!c.env.KAKAO_REST_API_KEY) {
    return c.json({ error: "KAKAO_REST_API_KEY is required" }, 500);
  }

  const keyword = decodeURIComponent(c.req.param("keyword"));
  const url = new URL(c.req.url);
  const searchParams = new URLSearchParams(url.search);
  const page = parseInt(searchParams.get("page") as string) || 1;
  const size = parseInt(searchParams.get("size") as string) || 15;
  const proxy = searchParams.get("proxy") === "true";
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

    return c.json({
      page,
      hasNext: items.length > size,
      items: items.slice(0, size),
    });
  } catch (error) {
    return c.json(error, 500);
  }
});

export default app;
