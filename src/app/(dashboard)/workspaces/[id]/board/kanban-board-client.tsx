"use client";

import { useEffect } from "react";
import { KanbanBoard } from "@/components/board/kanban-board";
import Link from "next/link";

export function KanbanBoardClient({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string;
  workspaceName: string;
}) {
  useEffect(() => {
    try {
      localStorage.setItem("taskapp-view-pref", "board");
    } catch {}
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <h1 className="text-lg font-bold text-ink">{workspaceName}</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/workspaces/${workspaceId}/board`}
            className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-lg cursor-pointer"
          >
            Board
          </Link>
          <Link
            href={`/workspaces/${workspaceId}/list`}
            className="px-3 py-1.5 text-sm font-medium text-ink/50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-150"
          >
            List
          </Link>
        </div>
      </div>
      <KanbanBoard workspaceId={workspaceId} />
    </div>
  );
}