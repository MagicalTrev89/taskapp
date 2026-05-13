import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  // Verify membership
  const membership = await prisma.membership.findUnique({
    where: {
      userId_workspaceId: { userId: session.user.id, workspaceId: id },
    },
    include: { workspace: true },
  });

  if (!membership) redirect("/");

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold">{membership.workspace.name}</h1>
      <p className="text-ink/60 mt-1">Kanban board coming soon</p>
    </div>
  );
}