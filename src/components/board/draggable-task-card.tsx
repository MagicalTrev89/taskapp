"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./task-card";

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

export function DraggableTaskCard({
  task,
  workspaceId,
}: {
  task: Task;
  workspaceId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {isOver && !isDragging && (
        <div className="h-0.5 bg-primary/40 rounded-full mb-2" />
      )}
      <TaskCard task={task} workspaceId={workspaceId} />
    </div>
  );
}