import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { createWorkspace } from "@/lib/actions/workspace";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user's workspaces
  const memberships = await prisma.membership.findMany({
    where: { userId: session.user.id },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });

  if (memberships.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-ink mb-2">
            You&apos;re not in any workspaces yet.
          </h2>
          <p className="text-ink/60 mb-6">
            Create a workspace to start managing tasks.
          </p>
          <form action={createWorkspace}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-cta hover:bg-cta-hover text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm shadow-cta/20 transition-all duration-150 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create a Workspace
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Redirect to first workspace's board
  const firstWorkspace = memberships[0].workspace;
  redirect(`/workspaces/${firstWorkspace.id}/board`);
}