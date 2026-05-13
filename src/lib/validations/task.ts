import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255).refine((val) => val.trim().length > 0, {
    message: "Title cannot be whitespace only",
  }),
  description: z.string().max(5000).optional(),
  statusId: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).refine((val) => val.trim().length > 0, {
    message: "Title cannot be whitespace only",
  }).optional(),
  description: z.string().max(5000).nullable().optional(),
  statusId: z.string().optional(),
});