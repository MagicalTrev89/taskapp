import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ListClient } from "./list-client";

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: session.user.id, workspaceId: id } },
    include: { workspace: true },
  });

  if (!membership) redirect("/");

  return <ListClient workspaceId={id} workspaceName={membership.workspace.name} />;
}