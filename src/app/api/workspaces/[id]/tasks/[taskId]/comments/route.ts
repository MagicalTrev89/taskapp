import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createCommentSchema = z.object({
  text: z.string().min(1).max(5000),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId, taskId } = await params;

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
  }

  // Verify task belongs to workspace
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      taskId,
      authorId: session.user.id,
      text: parsed.data.text,
    },
    include: {
      author: { select: { id: true, name: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId, taskId } = await params;

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 25;

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: { taskId },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comment.count({ where: { taskId } }),
  ]);

  return NextResponse.json({
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}