import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
});

export const updateStatusSchema = z.object({
  name: z.string().min(1).max(50),
});

export const reorderStatusesSchema = z.object({
  statusIds: z.array(z.string()),
});

export const deleteStatusSchema = z.object({
  targetStatusId: z.string().optional(),
});