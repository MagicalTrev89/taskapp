import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireOwner } from "@/lib/authz";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId, invitationId } = await params;
  const forbidden = await requireOwner(workspaceId, session.user.id);
  if (forbidden) return forbidden;

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation || invitation.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
  }

  if (invitation.status !== "PENDING") {
    return NextResponse.json({ error: "Only pending invitations can be cancelled" }, { status: 400 });
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "EXPIRED" },
  });

  return NextResponse.json({ success: true });
}