import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { TaskDetailClient } from "./task-detail-client";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id: workspaceId, taskId } = await params;

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId } },
  });

  if (!membership) redirect("/");

  return <TaskDetailClient workspaceId={workspaceId} taskId={taskId} userId={session.user.id} />;
}