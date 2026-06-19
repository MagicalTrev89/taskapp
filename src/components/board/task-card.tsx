"use client";

import Link from "next/link";

interface Status {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  statusId: string;
  position: number | null;
  status: Status;
  createdBy: { id: string; name: string; avatarUrl: string | null };
  createdAt: string;
  _count?: { comments: number };
}

export function TaskCard({
  task,
  workspaceId,
  isDragOverlay = false,
}: {
  task: Task;
  workspaceId: string;
  isDragOverlay?: boolean;
}) {
  const content = (
    <>
      <p className="text-sm font-medium text-ink leading-snug">{task.title}</p>
      {task.description && (
        <p className="text-xs text-ink/50 mt-1 line-clamp-2">{task.description}</p>
      )}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs text-ink/40">{task.createdBy.name}</span>
        {task._count && task._count.comments > 0 && (
          <span className="flex items-center gap-1 text-xs text-ink/40">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {task._count.comments}
          </span>
        )}
      </div>
    </>
  );

  if (isDragOverlay) {
    return (
      <div className="bg-white rounded-xl p-3 shadow-lg border border-primary/20">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/workspaces/${workspaceId}/tasks/${task.id}`}
      className="block bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-150"
    >
      {content}
    </Link>
  );
}