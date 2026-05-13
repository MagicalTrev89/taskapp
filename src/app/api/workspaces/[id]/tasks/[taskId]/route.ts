import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  statusId: z.string().optional(),
});

async function requireMember(workspaceId: string, userId: string) {
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
  }
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId, taskId } = await params;
  const forbidden = await requireMember(workspaceId, session.user.id);
  if (forbidden) return forbidden;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      status: true,
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      comments: {
        include: { author: { select: { id: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
        take: 25,
      },
    },
  });

  if (!task || task.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(task);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId, taskId } = await params;
  const forbidden = await requireMember(workspaceId, session.user.id);
  if (forbidden) return forbidden;

  const body = await request.json();
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Verify task belongs to workspace
  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing || existing.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: parsed.data,
    include: {
      status: true,
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId, taskId } = await params;
  const forbidden = await requireMember(workspaceId, session.user.id);
  if (forbidden) return forbidden;

  const existing = await prisma.task.findUnique({ where: { id: taskId } });
  if (!existing || existing.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // Cascade delete comments
  await prisma.comment.deleteMany({ where: { taskId } });
  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({ success: true });
}