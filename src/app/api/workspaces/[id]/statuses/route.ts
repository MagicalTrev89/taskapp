import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/authz";
import { z } from "zod";
import { createStatusSchema } from "@/lib/validations/status";

const reorderStatusesSchema = z.object({
  statusIds: z.array(z.string()),
});

export async function GET(
  _request: NextRequest,
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

  const statuses = await prisma.status.findMany({
    where: { workspaceId },
    orderBy: { position: "asc" },
  });

  return NextResponse.json(statuses);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId } = await params;
  const forbidden = await requireOwner(workspaceId, session.user.id);
  if (forbidden) return forbidden;

  const statusCount = await prisma.status.count({ where: { workspaceId } });
  if (statusCount >= 20) {
    return NextResponse.json(
      { error: "Maximum of 20 statuses per workspace" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const parsed = createStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name } = parsed.data;

  // Check case-insensitive uniqueness
  const existing = await prisma.status.findFirst({
    where: { workspaceId, name: { equals: name, mode: "insensitive" } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A status with this name already exists" },
      { status: 409 }
    );
  }

  const maxPosition = await prisma.status.findFirst({
    where: { workspaceId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const status = await prisma.status.create({
    data: {
      workspaceId,
      name,
      position: (maxPosition?.position ?? -1) + 1,
    },
  });

  return NextResponse.json(status, { status: 201 });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId } = await params;
  const forbidden = await requireOwner(workspaceId, session.user.id);
  if (forbidden) return forbidden;

  const body = await request.json();

  // Reorder
  if ("statusIds" in body) {
    const parsed = reorderStatusesSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { statusIds } = parsed.data;

    await prisma.$transaction(
      statusIds.map((statusId: string, index: number) =>
        prisma.status.update({
          where: { id: statusId },
          data: { position: index },
        })
      )
    );

    const statuses = await prisma.status.findMany({
      where: { workspaceId },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(statuses);
  }

  return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
}