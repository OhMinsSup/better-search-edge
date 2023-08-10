import { z } from "zod";

export const schemaQuery = z.object({
  page: z.string().optional().default("1"),
  size: z.string().optional().default("15"),
  proxy: z.string().optional().default("false"),
});
