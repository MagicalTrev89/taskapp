"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { useState, useRef, useEffect } from "react";

interface Workspace {
  id: string;
  name: string;
  role: string;
  memberCount: number;
}

interface SidebarProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const currentWorkspaceId = pathname.match(/\/workspaces\/([^/]+)/)?.[1];
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  const { data: workspaces = [] } = useQuery<Workspace[]>({
    queryKey: ["workspaces"],
    queryFn: async () => {
      const res = await fetch("/api/workspaces");
      if (!res.ok) throw new Error("Failed to fetch workspaces");
      return res.json();
    },
  });

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setSwitcherOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const basePath = currentWorkspaceId ? `/workspaces/${currentWorkspaceId}` : "";

  const navContent = (
    <>
      {/* Workspace switcher */}
      {currentWorkspaceId && (
        <div className="px-3 pt-4 pb-2 relative" ref={switcherRef}>
          <button
            onClick={() => setSwitcherOpen(!switcherOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-xl text-left cursor-pointer hover:bg-primary/10 transition-colors duration-150"
            aria-label="Switch workspace"
            aria-expanded={switcherOpen}
          >
            <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm font-semibold">
              {currentWorkspace?.name?.[0] ?? "W"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{currentWorkspace?.name ?? "Workspace"}</div>
              <div className="text-xs text-ink/50">{currentWorkspace?.memberCount ?? 0} members</div>
            </div>
            <svg className="w-4 h-4 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </button>
          {switcherOpen && (
            <div className="absolute left-3 right-3 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-2 max-h-64 overflow-y-auto">
              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/workspaces/${ws.id}/board`}
                  onClick={() => setSwitcherOpen(false)}
                  className={`block px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${ws.id === currentWorkspaceId ? "bg-primary/10 text-primary font-medium" : "text-ink/70"}`}
                >
                  <div className="font-medium truncate">{ws.name}</div>
                  <div className="text-xs text-ink/40">{ws.memberCount} members</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2" aria-label="Main navigation">
        {currentWorkspaceId && (
          <>
            <Link
              href={`${basePath}/board`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150 cursor-pointer ${pathname.endsWith("/board") ? "bg-primary/10 text-primary font-medium" : "text-ink/60 hover:bg-gray-100"}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Board
            </Link>
            <Link
              href={`${basePath}/list`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150 cursor-pointer ${pathname.endsWith("/list") ? "bg-primary/10 text-primary font-medium" : "text-ink/60 hover:bg-gray-100"}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
              </svg>
              List
            </Link>
            <Link
              href={`${basePath}/settings`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors duration-150 cursor-pointer ${pathname.endsWith("/settings") ? "bg-primary/10 text-primary font-medium" : "text-ink/60 hover:bg-gray-100"}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2">
          {user.image ? (
            <img src={user.image} alt={user.name ?? ""} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-cta text-white flex items-center justify-center text-sm font-semibold">{initials}</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-ink/40 truncate">{user.email}</div>
          </div>
          <SignOutButton />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-4 left-4 z-30 w-10 h-10 bg-white rounded-lg shadow-md border border-gray-200 flex items-center justify-center cursor-pointer"
        aria-label="Toggle menu"
      >
        {mobileOpen ? (
          <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-ink" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-20"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar: hidden on mobile unless toggled, always visible on md+ */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 flex flex-col z-20 transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <span className="font-bold text-lg text-ink">TaskApp</span>
        </div>
        {navContent}
      </aside>
    </>
  );
}