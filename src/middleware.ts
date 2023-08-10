import type { MiddlewareHandler } from "hono";
import { KakaoKeyError } from "./error";

export const validateKakoKey = (): MiddlewareHandler => {
  return async (c, next) => {
    if (!c.env.KAKAO_REST_API_KEY) {
      throw KakaoKeyError({
        message: "KAKAO_REST_API_KEY is not set",
      });
    }

    await next();
  };
};
