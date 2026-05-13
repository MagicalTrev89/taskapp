import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createWorkspaceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name } = parsed.data;

  // Check workspace limit
  const membershipCount = await prisma.membership.count({
    where: { userId: session.user.id },
  });

  if (membershipCount >= 10) {
    return NextResponse.json(
      { error: "You have reached the maximum number of workspaces (10)" },
      { status: 400 }
    );
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      members: {
        create: {
          userId: session.user.id,
          role: "OWNER",
        },
      },
      statuses: {
        create: [
          { name: "To Do", position: 0 },
          { name: "In Progress", position: 1 },
          { name: "Completed", position: 2 },
        ],
      },
    },
    include: {
      members: true,
      statuses: { orderBy: { position: "asc" } },
    },
  });

  return NextResponse.json(workspace, { status: 201 });
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: {
      workspace: {
        include: {
          _count: { select: { members: true } },
          statuses: { orderBy: { position: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const workspaces = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    role: m.role,
    memberCount: m.workspace._count.members,
    createdAt: m.workspace.createdAt,
  }));

  return NextResponse.json(workspaces);
}