import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/authz";
import { updateTaskSchema } from "@/lib/validations/task";

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

  const { statusId, position, ...otherFields } = parsed.data;

  // If statusId changed, move task to top of new column (position = 0)
  if (statusId && statusId !== existing.statusId) {
    const task = await prisma.$transaction(async (tx) => {
      // Shift existing tasks in the target column up by 1
      await tx.task.updateMany({
        where: { workspaceId, statusId, position: { not: null } },
        data: { position: { increment: 1 } },
      });

      return tx.task.update({
        where: { id: taskId },
        data: {
          ...otherFields,
          statusId,
          position: 0,
        },
        include: {
          status: true,
          createdBy: { select: { id: true, name: true, avatarUrl: true } },
        },
      });
    });

    return NextResponse.json(task);
  }

  // Status unchanged — update other fields (including position if provided)
  const updateData: Record<string, unknown> = { ...otherFields };
  if (position !== undefined) {
    updateData.position = position;
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
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

  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({ success: true });
}