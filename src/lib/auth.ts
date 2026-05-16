import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/db";

const DEFAULT_STATUSES = ["To Do", "In Progress", "Completed"];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account?.providerAccountId) {
        return false;
      }

      // Upsert user and provision default workspace if new
      await prisma.$transaction(async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: { googleId: account.providerAccountId },
        });

        if (!existingUser) {
          const userName = user.name ?? user.email!.split("@")[0];
          const newUser = await tx.user.create({
            data: {
              googleId: account.providerAccountId,
              email: user.email!,
              name: userName,
              avatarUrl: user.image ?? null,
            },
          });

          // Auto-provision default workspace
          const workspace = await tx.workspace.create({
            data: {
              name: `${newUser.name.split(" ")[0]}'s Workspace`,
            },
          });

          // Add user as Owner
          await tx.membership.create({
            data: {
              userId: newUser.id,
              workspaceId: workspace.id,
              role: "OWNER",
            },
          });

          // Create default statuses
          for (let i = 0; i < DEFAULT_STATUSES.length; i++) {
            await tx.status.create({
              data: {
                workspaceId: workspace.id,
                name: DEFAULT_STATUSES[i],
                position: i,
              },
            });
          }
        }
      });

      return true;
    },
    async session({ session, token }) {
      if (token?.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, account }) {
      // On initial sign-in, replace Google's sub with the DB CUID so all
      // DB queries keyed on userId work correctly.
      if (account?.providerAccountId) {
        const dbUser = await prisma.user.findUnique({
          where: { googleId: account.providerAccountId },
          select: { id: true },
        });
        if (dbUser) token.sub = dbUser.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});