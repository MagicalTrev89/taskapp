import { z } from "zod";

export const createCommentSchema = z.object({
  text: z.string().min(1).max(5000).refine((val) => val.trim().length > 0, {
    message: "Comment cannot be whitespace only",
  }),
});