import { z } from "zod";

export const createStatusSchema = z.object({
  name: z.string().min(1).max(50).refine((val) => val.trim().length > 0, {
    message: "Status name cannot be whitespace only",
  }),
});

export const updateStatusSchema = z.object({
  name: z.string().min(1).max(50).refine((val) => val.trim().length > 0, {
    message: "Status name cannot be whitespace only",
  }),
});

export const deleteStatusSchema = z.object({
  targetStatusId: z.string().optional(),
});