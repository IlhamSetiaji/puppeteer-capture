import { z } from "zod";

export const takeScreenshotRequest = z.object({
  fileName: z
    .string()
    .min(1, "File name is required")
    .max(255, "File name is too long"),
  url: z.string().url("Invalid URL format").min(1, "URL is required"),
  options: z
    .object({
      fullPage: z.boolean().optional(),
      waitUntil: z
        .enum(["load", "domcontentloaded", "networkidle0", "networkidle2"])
        .optional(),
      timeout: z.number().int().min(0).optional(),
    })
    .optional(),
});
