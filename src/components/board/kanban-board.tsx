"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  rectIntersection,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toast";
import { TaskCard } from "./task-card";
import { DraggableTaskCard } from "./draggable-task-card";

interface Status {
  id: string;
  name: string;
  position: number;
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

function sortTasksByPosition(a: Task, b: Task): number {
  if (a.position === null && b.position === null) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }
  if (a.position === null) return 1;
  if (b.position === null) return -1;
  return a.position - b.position;
}

export function KanbanBoard({ workspaceId }: { workspaceId: string }) {
  const queryClient = useQueryClient();
  const { toasts, addToast } = useToast();
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [showNewTask, setShowNewTask] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const { data: statuses = [], isLoading: loadingStatuses } = useQuery<Status[]>({
    queryKey: ["statuses", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/statuses`);
      if (!res.ok) throw new Error("Failed to fetch statuses");
      return res.json();
    },
  });

  const { data: tasksData, isLoading: loadingTasks } = useQuery<{ tasks: Task[] }>({
    queryKey: ["tasks", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks?limit=500`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });

  const tasks = tasksData?.tasks ?? [];

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, statusId }: { taskId: string; statusId: string }) => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/tasks/${taskId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ statusId }),
        }
      );
      if (!res.ok) throw new Error("Failed to move task");
      return res.json();
    },
    onMutate: async ({ taskId, statusId }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", workspaceId] });
      const previousTasks = queryClient.getQueryData<{ tasks: Task[] }>(["tasks", workspaceId]);
      queryClient.setQueryData<{ tasks: Task[] }>(["tasks", workspaceId], (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === taskId ? { ...t, statusId, position: 0 } : t
          ),
        };
      });
      return { previousTasks };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
    },
    onError: (_err, _variables, context) => {
      addToast("Failed to move task", "error");
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", workspaceId], context.previousTasks);
      }
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ statusId, taskIds }: { statusId: string; taskIds: string[] }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusId, taskIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder tasks");
      return res.json();
    },
    onMutate: async ({ statusId, taskIds }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", workspaceId] });
      const previousTasks = queryClient.getQueryData<{ tasks: Task[] }>(["tasks", workspaceId]);
      queryClient.setQueryData<{ tasks: Task[] }>(["tasks", workspaceId], (old) => {
        if (!old) return old;
        const updated = old.tasks.map((t) => {
          if (t.statusId !== statusId) return t;
          const index = taskIds.indexOf(t.id);
          if (index === -1) return t;
          return { ...t, position: index };
        });
        return { ...old, tasks: updated };
      });
      return { previousTasks };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
    },
    onError: (_err, _variables, context) => {
      addToast("Failed to reorder tasks", "error");
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks", workspaceId], context.previousTasks);
      }
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async ({ title, statusId }: { title: string; statusId: string }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, statusId }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      setShowNewTask(null);
      addToast("Task created");
    },
    onError: () => {
      addToast("Failed to create task", "error");
    },
  });

  const handleCreateTask = useCallback(
    (title: string, statusId: string) => {
      createTaskMutation.mutate({ title, statusId });
    },
    [createTaskMutation]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveTaskId(String(event.active.id));
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }
    const overId = String(over.id);
    if (statuses.some((s) => s.id === overId)) {
      setOverColumnId(overId);
    } else {
      const targetTask = tasks.find((t) => t.id === overId);
      if (targetTask) {
        setOverColumnId(targetTask.statusId);
      }
    }
  }, [statuses, tasks]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTaskId(null);
      setOverColumnId(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = String(active.id);
      const overId = String(over.id);

      let targetStatusId: string;
      if (statuses.some((s) => s.id === overId)) {
        targetStatusId = overId;
      } else {
        const targetTask = tasks.find((t) => t.id === overId);
        if (targetTask) {
          targetStatusId = targetTask.statusId;
        } else {
          return;
        }
      }

      const movedTask = tasks.find((t) => t.id === taskId);
      if (!movedTask) return;

      if (movedTask.statusId !== targetStatusId) {
        updateTaskMutation.mutate({ taskId, statusId: targetStatusId });
      } else {
        const columnTasks = tasks
          .filter((t) => t.statusId === targetStatusId)
          .sort(sortTasksByPosition);

        const overTaskIndex = columnTasks.findIndex((t) => t.id === overId);
        const activeIndex = columnTasks.findIndex((t) => t.id === taskId);

        if (activeIndex === -1 || overTaskIndex === -1 || activeIndex === overTaskIndex) return;

        const newOrder = [...columnTasks];
        const [moved] = newOrder.splice(activeIndex, 1);
        newOrder.splice(overTaskIndex, 0, moved);

        const taskIds = newOrder.map((t) => t.id);
        reorderMutation.mutate({ statusId: targetStatusId, taskIds });
      }
    },
    [statuses, tasks, updateTaskMutation, reorderMutation]
  );

  const handleDragCancel = useCallback(() => {
    setActiveTaskId(null);
    setOverColumnId(null);
  }, []);

  if (loadingStatuses || loadingTasks) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <p className="text-ink/60 mb-2">No statuses configured.</p>
          <Link
            href={`/workspaces/${workspaceId}/settings`}
            className="text-primary font-medium hover:underline"
          >
            Add statuses in settings
          </Link>
        </div>
      </div>
    );
  }

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  const totalTasks = tasks.length;

  return (
    <div className="flex-1 overflow-x-auto">
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 p-6 h-full min-w-max">
          {statuses.map((status) => {
            const columnTasks = tasks
              .filter((t) => t.statusId === status.id)
              .sort(sortTasksByPosition);

            const isOverColumn = overColumnId === status.id;

            return (
              <DroppableColumn key={status.id} id={status.id} isOver={isOverColumn}>
                <div className="flex flex-col w-72 min-w-[288px] bg-gray-50 rounded-2xl transition-colors duration-150">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-ink">{status.name}</h2>
                      <span className="text-xs text-ink/40 bg-ink/5 px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowNewTask(status.id)}
                      className="w-6 h-6 flex items-center justify-center text-ink/40 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors duration-150 cursor-pointer"
                      aria-label={`Add task to ${status.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>

                  <SortableContext
                    items={columnTasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto">
                      {showNewTask === status.id && (
                        <NewTaskCard
                          onSubmit={(title) =>
                            createTaskMutation.mutate({ title, statusId: status.id })
                          }
                          onCancel={() => setShowNewTask(null)}
                          isLoading={createTaskMutation.isPending}
                        />
                      )}
                      {columnTasks.map((task) => (
                        <DraggableTaskCard key={task.id} task={task} workspaceId={workspaceId} />
                      ))}
                      {columnTasks.length === 0 && !showNewTask && (
                        <div className="text-center py-8 text-ink/30 text-sm">
                          {totalTasks === 0 ? (
                            <button
                              onClick={() => setShowNewTask(status.id)}
                              className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                              Create your first task
                            </button>
                          ) : (
                            "No tasks"
                          )}
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </div>
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-72">
              <TaskCard task={activeTask} workspaceId={workspaceId} isDragOverlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      <Toaster toasts={toasts} />
    </div>
  );
}

function NewTaskCard({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (title: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [title, setTitle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSubmit(title.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-3 shadow-sm border border-primary/20">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title..."
        className="w-full text-sm text-ink bg-transparent outline-none placeholder:text-ink/30"
        autoFocus
        disabled={isLoading}
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          type="submit"
          disabled={!title.trim() || isLoading}
          className="text-xs font-medium bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors duration-150 disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? "Adding..." : "Add"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-ink/50 hover:text-ink px-2 py-1.5 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function DroppableColumn({ id, isOver, children }: { id: string; isOver: boolean; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={
        isOver
          ? "ring-2 ring-primary/50 rounded-2xl"
          : undefined
      }
    >
      {children}
    </div>
  );
}