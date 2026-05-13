import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";

interface SidebarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col z-20">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <span className="font-bold text-lg text-ink">TaskApp</span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4" aria-label="Main navigation">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-ink/60 hover:bg-gray-100 text-sm transition-colors duration-150 cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Home
        </Link>
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? ""}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-cta text-white flex items-center justify-center text-sm font-semibold">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-ink/40 truncate">{user.email}</div>
          </div>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}