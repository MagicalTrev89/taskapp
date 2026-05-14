import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createTaskSchema } from "@/lib/validations/task";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId } = await params;

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }

  const { title, description, statusId } = parsed.data;

  // Check task limit
  const taskCount = await prisma.task.count({ where: { workspaceId } });
  if (taskCount >= 10000) {
    return NextResponse.json({ error: "Maximum of 10,000 tasks per workspace" }, { status: 400 });
  }

  // Determine status
  let finalStatusId = statusId;
  if (!finalStatusId) {
    const firstStatus = await prisma.status.findFirst({
      where: { workspaceId },
      orderBy: { position: "asc" },
    });
    if (!firstStatus) {
      return NextResponse.json({ error: "Workspace has no statuses" }, { status: 400 });
    }
    finalStatusId = firstStatus.id;
  }

  const task = await prisma.$transaction(async (tx) => {
    // Shift existing tasks in the column down by 1, then create at position 0
    await tx.task.updateMany({
      where: {
        workspaceId,
        statusId: finalStatusId,
        position: { not: null },
      },
      data: { position: { increment: 1 } },
    });

    return tx.task.create({
      data: {
        workspaceId,
        statusId: finalStatusId,
        title,
        description: description ?? null,
        createdById: session.user.id,
        position: 0,
      },
      include: {
        status: true,
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
  });

  return NextResponse.json(task, { status: 201 });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId } = await params;

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const statusId = searchParams.get("statusId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = 50;
  const allowedSortFields = ["createdAt", "title", "statusId"] as const;
  const sortByParam = searchParams.get("sortBy") || "createdAt";
  const sortBy = allowedSortFields.includes(sortByParam as typeof allowedSortFields[number]) ? sortByParam : "createdAt";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const where: Record<string, unknown> = { workspaceId };
  if (statusId) {
    where.statusId = statusId;
  }

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      include: {
        status: true,
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return NextResponse.json({
    tasks,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}