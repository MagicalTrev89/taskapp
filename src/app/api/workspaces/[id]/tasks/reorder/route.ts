import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/authz";
import { z } from "zod";

const reorderTasksSchema = z.object({
  statusId: z.string(),
  taskIds: z.array(z.string()).min(1),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId } = await params;
  const forbidden = await requireMember(workspaceId, session.user.id);
  if (forbidden) return forbidden;

  const body = await request.json();
  const parsed = reorderTasksSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { statusId, taskIds } = parsed.data;

  // Verify the status belongs to this workspace
  const status = await prisma.status.findFirst({
    where: { id: statusId, workspaceId },
  });
  if (!status) {
    return NextResponse.json({ error: "Status not found" }, { status: 404 });
  }

  // Verify all tasks belong to this workspace and the specified status
  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds }, workspaceId, statusId },
  });

  if (tasks.length !== taskIds.length) {
    return NextResponse.json(
      { error: "One or more tasks not found in this status column" },
      { status: 400 }
    );
  }

  // Assign sequential positions in a transaction
  // Set position to null for tasks in this column not included in taskIds
  // (e.g., tasks loaded on a later page that weren't visible during drag)
  await prisma.$transaction([
    // Assign positions for specified tasks
    ...taskIds.map((taskId: string, index: number) =>
      prisma.task.update({
        where: { id: taskId },
        data: { position: index },
      })
    ),
    // Clear positions for tasks in the column that weren't included
    prisma.task.updateMany({
      where: {
        workspaceId,
        statusId,
        id: { notIn: taskIds },
      },
      data: { position: null },
    }),
  ]);

  // Return updated tasks
  const updatedTasks = await prisma.task.findMany({
    where: { workspaceId, statusId },
    orderBy: [{ position: { sort: "asc", nulls: "last" } }, { createdAt: "desc" }],
    include: {
      status: true,
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(updatedTasks);
}