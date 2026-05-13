import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/authz";
import { z } from "zod";
import crypto from "crypto";

const inviteSchema = z.object({
  email: z.string().email(),
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

  const [members, invitations] = await Promise.all([
    prisma.membership.findMany({
      where: { workspaceId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invitation.findMany({
      where: { workspaceId, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ members, invitations });
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

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const { email } = parsed.data;

  // Check if already a member
  const existingMember = await prisma.user.findUnique({
    where: { email },
    include: { memberships: { where: { workspaceId } } },
  });

  if (existingMember && existingMember.memberships.length > 0) {
    return NextResponse.json({ error: "This person is already a member" }, { status: 409 });
  }

  // Check if already invited
  const existingInvite = await prisma.invitation.findFirst({
    where: { workspaceId, email, status: "PENDING" },
  });

  if (existingInvite) {
    return NextResponse.json({ error: "An invitation has already been sent to this email" }, { status: 409 });
  }

  // Check member limit
  const memberCount = await prisma.membership.count({ where: { workspaceId } });
  if (memberCount >= 50) {
    return NextResponse.json({ error: "Maximum of 50 members per workspace" }, { status: 400 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await prisma.invitation.create({
    data: {
      workspaceId,
      email,
      token,
      status: "PENDING",
      expiresAt,
      invitedById: session.user.id,
    },
  });

  // TODO: Send invitation email via Resend (ADR-007)
  // For now, return the invitation with the token so it can be shared

  return NextResponse.json(invitation, { status: 201 });
}

export async function DELETE(
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

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  // Cannot remove the owner
  const targetMembership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  if (!targetMembership) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (targetMembership.role === "OWNER") {
    return NextResponse.json({ error: "Cannot remove the workspace owner" }, { status: 400 });
  }

  await prisma.membership.delete({
    where: { userId_workspaceId: { userId, workspaceId } },
  });

  return NextResponse.json({ success: true });
}