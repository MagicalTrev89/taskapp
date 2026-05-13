import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string; commentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: workspaceId, taskId, commentId } = await params;

  // Verify workspace membership
  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });
  if (!membership) {
    return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { task: { select: { workspaceId: true } } },
  });

  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // Verify comment belongs to the task and workspace
  if (comment.taskId !== taskId || comment.task.workspaceId !== workspaceId) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  // Only the author can delete their own comment
  if (comment.authorId !== session.user.id) {
    return NextResponse.json({ error: "Only the comment author can delete this comment" }, { status: 403 });
  }

  await prisma.comment.delete({ where: { id: commentId } });

  return NextResponse.json({ success: true });
}