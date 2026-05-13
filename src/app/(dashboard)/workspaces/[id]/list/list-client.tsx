"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toast";

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
  status: Status;
  createdBy: { id: string; name: string; avatarUrl: string | null };
  createdAt: string;
  _count?: { comments: number };
}

type SortField = "title" | "status" | "createdAt";
type SortOrder = "asc" | "desc";

export function ListClient({
  workspaceId,
  workspaceName,
}: {
  workspaceId: string;
  workspaceName: string;
}) {
  const queryClient = useQueryClient();
  const { toasts, addToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem("taskapp-view-pref", "list");
    } catch {}
  }, []);

  const { data: statuses = [] } = useQuery<Status[]>({
    queryKey: ["statuses", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/statuses`);
      if (!res.ok) throw new Error("Failed to fetch statuses");
      return res.json();
    },
  });

  const [page, setPage] = useState(1);
  const pageSize = 50;

  const { data: tasksData, isLoading } = useQuery<{ tasks: Task[]; total: number; page: number; totalPages: number }>({
    queryKey: ["tasks", workspaceId, statusFilter, sortField, sortOrder, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        sortBy: sortField === "status" ? "statusId" : sortField,
        sortOrder,
      });
      if (statusFilter !== "all") params.set("statusId", statusFilter);
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks?${params}`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; statusId?: string }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      setShowNewTask(false);
      setNewTaskTitle("");
      setNewTaskDescription("");
      addToast("Task created");
    },
    onError: () => {
      addToast("Failed to create task", "error");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      addToast("Task deleted");
    },
    onError: () => {
      addToast("Failed to delete task", "error");
    },
  });

  const tasks = tasksData?.tasks ?? [];
  const totalPages = tasksData?.totalPages ?? 1;
  const total = tasksData?.total ?? 0;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "createdAt" ? "desc" : "asc");
    }
    setPage(1);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const defaultStatusId = statuses.sort((a, b) => a.position - b.position)[0]?.id;

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
        <h1 className="text-lg font-bold text-ink">{workspaceName}</h1>
        <div className="flex items-center gap-2">
          <Link
            href={`/workspaces/${workspaceId}/board`}
            className="px-3 py-1.5 text-sm font-medium text-ink/50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors duration-150"
          >
            Board
          </Link>
          <Link
            href={`/workspaces/${workspaceId}/list`}
            className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary rounded-lg cursor-pointer"
          >
            List
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-ink focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="all">All statuses</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <span className="text-sm text-ink/40">{total} tasks</span>
          </div>
          <button
            onClick={() => setShowNewTask(true)}
            className="inline-flex items-center gap-2 bg-cta hover:bg-cta-hover text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-sm shadow-cta/20 transition-all duration-150 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </button>
        </div>

        {showNewTask && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newTaskTitle.trim()) {
                createTaskMutation.mutate({
                  title: newTaskTitle.trim(),
                  description: newTaskDescription.trim() || undefined,
                  statusId: defaultStatusId,
                });
              }
            }}
            className="bg-white rounded-xl border border-primary/20 p-4 mb-4 shadow-sm"
          >
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Task title"
              className="w-full text-sm font-medium text-ink bg-transparent outline-none placeholder:text-ink/30 mb-2"
              autoFocus
            />
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full text-sm text-ink/70 bg-transparent outline-none placeholder:text-ink/30 resize-none"
              rows={2}
            />
            <div className="flex items-center gap-2 mt-3">
              <button
                type="submit"
                disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
                className="text-sm font-medium bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-primary-dark transition-colors duration-150 disabled:opacity-50 cursor-pointer"
              >
                {createTaskMutation.isPending ? "Creating..." : "Create Task"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewTask(false);
                  setNewTaskTitle("");
                  setNewTaskDescription("");
                }}
                className="text-sm text-ink/50 hover:text-ink px-3 py-1.5 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            {statusFilter !== "all" ? (
              <>
                <p className="text-ink/40 text-sm mb-2">No tasks match this filter.</p>
                <button
                  onClick={() => setStatusFilter("all")}
                  className="text-primary text-sm font-medium hover:underline cursor-pointer"
                >
                  Clear filter
                </button>
              </>
            ) : (
              <>
                <p className="text-ink/40 text-sm mb-4">No tasks yet. Create your first task to get started.</p>
                <button
                  onClick={() => setShowNewTask(true)}
                  className="inline-flex items-center gap-2 bg-cta hover:bg-cta-hover text-white font-semibold text-sm px-4 py-2 rounded-xl shadow-sm shadow-cta/20 transition-all duration-150 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create your first task
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th
                    onClick={() => handleSort("title")}
                    className="text-left text-xs font-semibold text-ink/50 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-ink"
                  >
                    Title {sortField === "title" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="text-left text-xs font-semibold text-ink/50 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-ink"
                  >
                    Status {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className="text-left text-xs font-semibold text-ink/50 uppercase tracking-wider px-4 py-3 cursor-pointer hover:text-ink"
                  >
                    Created {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors duration-150"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/workspaces/${workspaceId}/tasks/${task.id}`}
                        className="text-sm font-medium text-ink hover:text-primary transition-colors duration-150"
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="text-xs text-ink/40 mt-0.5 line-clamp-1">{task.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {task.status.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-ink/50">
                      {formatDate(task.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (confirm("Delete this task?")) {
                            deleteTaskMutation.mutate(task.id);
                          }
                        }}
                        className="text-ink/30 hover:text-red-500 transition-colors duration-150 cursor-pointer"
                        aria-label="Delete task"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <span className="text-sm text-ink/40">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="text-sm text-ink/50 hover:text-ink px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="text-sm text-ink/50 hover:text-ink px-3 py-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Toaster toasts={toasts} />
    </div>
  );
}