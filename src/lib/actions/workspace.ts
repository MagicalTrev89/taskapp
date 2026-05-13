"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

const DEFAULT_STATUSES = ["To Do", "In Progress", "Completed"];

export async function createWorkspace() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/login");
  }

  // Check workspace limit
  const membershipCount = await prisma.membership.count({
    where: { userId: user.id },
  });

  if (membershipCount >= 10) {
    throw new Error("You have reached the maximum number of workspaces (10)");
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: `${user.name.split(" ")[0]}'s Workspace`,
      members: {
        create: {
          userId: user.id,
          role: "OWNER",
        },
      },
      statuses: {
        create: DEFAULT_STATUSES.map((name, index) => ({
          name,
          position: index,
        })),
      },
    },
  });

  redirect(`/workspaces/${workspace.id}/board`);
}