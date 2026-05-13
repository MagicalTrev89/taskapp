import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/authz";
import { z } from "zod";

const updateStatusSchema = z.object({
  name: z.string().min(1).max(50),
});

const deleteStatusSchema = z.object({
  targetStatusId: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId, sid: statusId } = await params;
  const forbidden = await requireOwner(workspaceId, session.user.id);
  if (forbidden) return forbidden;

  const body = await request.json();
  const parsed = updateStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name } = parsed.data;

  // Check case-insensitive uniqueness
  const existing = await prisma.status.findFirst({
    where: {
      workspaceId,
      name: { equals: name, mode: "insensitive" },
      id: { not: statusId },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A status with this name already exists" },
      { status: 409 }
    );
  }

  const status = await prisma.status.update({
    where: { id: statusId },
    data: { name },
  });

  return NextResponse.json(status);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId, sid: statusId } = await params;
  const forbidden = await requireOwner(workspaceId, session.user.id);
  if (forbidden) return forbidden;

  // Check at least one status remains
  const statusCount = await prisma.status.count({
    where: { workspaceId },
  });
  if (statusCount <= 1) {
    return NextResponse.json(
      { error: "A workspace must have at least one status" },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = deleteStatusSchema.safeParse(body);

  // Count tasks with this status
  const taskCount = await prisma.task.count({
    where: { statusId },
  });

  if (taskCount > 0) {
    if (!parsed.success || !parsed.data.targetStatusId) {
      return NextResponse.json(
        { error: "Must specify targetStatusId to move tasks to", taskCount },
        { status: 400 }
      );
    }

    // Move tasks to target status
    await prisma.task.updateMany({
      where: { statusId },
      data: { statusId: parsed.data.targetStatusId },
    });
  }

  // Reorder remaining statuses
  await prisma.status.delete({ where: { id: statusId } });

  // Re-assign positions
  const remaining = await prisma.status.findMany({
    where: { workspaceId },
    orderBy: { position: "asc" },
  });

  await prisma.$transaction(
    remaining.map((s, i) =>
      prisma.status.update({ where: { id: s.id }, data: { position: i } })
    )
  );

  return NextResponse.json({ success: true });
}