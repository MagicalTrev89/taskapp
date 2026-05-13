import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invitation) {
    return NextResponse.redirect(new URL("/?error=invitation-not-found", request.url));
  }

  if (invitation.status !== "PENDING") {
    return NextResponse.redirect(new URL("/?error=invitation-already-accepted", request.url));
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.redirect(new URL("/?error=invitation-expired", request.url));
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: invitation.email },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/?error=user-not-found", request.url));
  }

  // Check if already a member
  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: { userId: user.id, workspaceId: invitation.workspaceId },
    },
  });

  if (existingMembership) {
    // Already a member, just mark invitation as accepted
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });
    return NextResponse.redirect(
      new URL(`/workspaces/${invitation.workspaceId}/board`, request.url)
    );
  }

  // Create membership and update invitation in a transaction
  await prisma.$transaction([
    prisma.membership.create({
      data: {
        userId: user.id,
        workspaceId: invitation.workspaceId,
        role: "MEMBER",
      },
    }),
    prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    }),
  ]);

  return NextResponse.redirect(
    new URL(`/workspaces/${invitation.workspaceId}/board`, request.url)
  );
}