import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

type Bindings = {
  INDEX: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", logger());

app.use("/api/v1/*", cors());

app.get("/api/v1/local/search/:keyword", (c) => {
  const keyword = decodeURIComponent(c.req.param("keyword"));
  const url = new URL(c.req.url);
  const searchParams = new URLSearchParams(url.search);
  const page = parseInt(searchParams.get("page") as string) || 1;
  const size = parseInt(searchParams.get("size") as string) || 15;
  const proxy = searchParams.get("proxy") === "true";

  const maxPage = 45;
  if (page < 0) {
    return c.json({ message: "page must be greater than zero" }, 400);
  } else if (page > maxPage) {
    return c.json({ message: `page must be less than ${maxPage}` }, 400);
  }

  const maxSize = 45;
  if (size < 0) {
    return c.json({ message: "size must be greater than zero" }, 400);
  } else if (size > maxSize) {
    return c.json({ message: `size must be less than ${maxSize}` }, 400);
  }

  return c.text("Hello Hono!");
});

export default app;
