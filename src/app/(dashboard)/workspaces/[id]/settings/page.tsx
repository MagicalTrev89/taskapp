import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { SettingsClient } from "./settings-client";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: id } },
  });

  if (!membership) redirect("/");

  const isOwner = membership.role === "OWNER";

  const workspace = await prisma.workspace.findUnique({
    where: { id },
    select: { name: true },
  });

  return (
    <SettingsClient
      workspaceId={id}
      workspaceName={workspace?.name ?? "Workspace"}
      userId={session.user.id}
      isOwner={isOwner}
    />
  );
}