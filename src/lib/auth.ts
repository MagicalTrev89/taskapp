import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";

const DEFAULT_STATUSES = ["To Do", "In Progress", "Completed"];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const password = process.env.LOCAL_PASSWORD;
        if (!password || credentials?.password !== password) return null;

        const email = process.env.LOCAL_USER_EMAIL ?? "local@taskapp.local";
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
              data: { email, name: email.split("@")[0], avatarUrl: null },
            });
            const workspace = await tx.workspace.create({
              data: { name: "My Workspace" },
            });
            await tx.membership.create({
              data: { userId: newUser.id, workspaceId: workspace.id, role: "OWNER" },
            });
            for (let i = 0; i < DEFAULT_STATUSES.length; i++) {
              await tx.status.create({
                data: { workspaceId: workspace.id, name: DEFAULT_STATUSES[i], position: i },
              });
            }
            return newUser;
          });
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
