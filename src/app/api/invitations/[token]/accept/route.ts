import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const session = await auth();

  // Redirect unauthenticated users to login, preserving the invitation URL
  if (!session?.user?.id) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    loginUrl.searchParams.set("error", "invitation-login-required");
    return NextResponse.redirect(loginUrl);
  }

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

  // Verify the logged-in user's email matches the invited email
  if (session.user.email !== invitation.email) {
    return NextResponse.redirect(
      new URL(`/?error=invitation-email-mismatch&invited=${encodeURIComponent(invitation.email)}`, request.url)
    );
  }

  // Check if already a member
  const existingMembership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId: invitation.workspaceId },
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
        userId: session.user.id,
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