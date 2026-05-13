import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
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

  // Owner cannot leave (must transfer ownership or delete workspace)
  if (membership.role === "OWNER") {
    return NextResponse.json({ error: "Workspace owner cannot leave. Transfer ownership or delete the workspace." }, { status: 400 });
  }

  await prisma.membership.delete({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });

  return NextResponse.json({ success: true });
}