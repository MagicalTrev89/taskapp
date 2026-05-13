import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Checks whether the given user is an OWNER of the workspace.
 * Returns a 403 NextResponse if not, or null if authorized.
 */
export async function requireOwner(
  workspaceId: string,
  userId: string
): Promise<NextResponse | null> {
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!membership || membership.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only workspace owners can perform this action" },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Checks whether the given user is a member of the workspace.
 * Returns a 403 NextResponse if not, or null if authorized.
 */
export async function requireMember(
  workspaceId: string,
  userId: string
): Promise<NextResponse | null> {
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  });
  if (!membership) {
    return NextResponse.json(
      { error: "Not a member of this workspace" },
      { status: 403 }
    );
  }
  return null;
}