"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toast";

interface Status {
  id: string;
  name: string;
  position: number;
}

interface Comment {
  id: string;
  text: string;
  createdAt: string;
  author: { id: string; name: string; avatarUrl: string | null };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  statusId: string;
  status: Status;
  createdBy: { id: string; name: string; avatarUrl: string | null };
  createdAt: string;
  comments?: Comment[];
}

export function TaskDetailClient({
  workspaceId,
  taskId,
  userId,
}: {
  workspaceId: string;
  taskId: string;
  userId: string;
}) {
  const queryClient = useQueryClient();
  const { toasts, addToast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatusId, setEditStatusId] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentPage, setCommentPage] = useState(1);
  const [backHref, setBackHref] = useState(`/workspaces/${workspaceId}/board`);

  useEffect(() => {
    try {
      const pref = localStorage.getItem("taskapp-view-pref");
      if (pref === "list") {
        setBackHref(`/workspaces/${workspaceId}/list`);
      } else {
        setBackHref(`/workspaces/${workspaceId}/board`);
      }
    } catch {
      // localStorage unavailable, default to board
    }
  }, [workspaceId]);

  const { data: task, isLoading } = useQuery<Task>({
    queryKey: ["task", workspaceId, taskId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}`);
      if (!res.ok) throw new Error("Failed to fetch task");
      return res.json();
    },
  });

  const { data: statuses = [] } = useQuery<Status[]>({
    queryKey: ["statuses", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/statuses`);
      if (!res.ok) throw new Error("Failed to fetch statuses");
      return res.json();
    },
  });

  const { data: commentsData } = useQuery<{ comments: Comment[]; total: number; page: number; totalPages: number }>({
    queryKey: ["comments", workspaceId, taskId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
  });

  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [hasMoreComments, setHasMoreComments] = useState(false);

  useEffect(() => {
    if (commentsData) {
      setAllComments(commentsData.comments);
      setHasMoreComments(commentsData.page < commentsData.totalPages);
    }
  }, [commentsData]);

  const loadMoreComments = async () => {
    const nextPage = (commentsData?.page ?? 1) + 1;
    const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments?page=${nextPage}`);
    if (res.ok) {
      const data = await res.json();
      setAllComments((prev) => [...prev, ...data.comments]);
      setHasMoreComments(nextPage < data.totalPages);
    }
  };

  const updateTaskMutation = useMutation({
    mutationFn: async (data: { title?: string; description?: string | null; statusId?: string }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", workspaceId, taskId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      setIsEditing(false);
      addToast("Task updated");
    },
    onError: () => {
      addToast("Failed to update task", "error");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete task");
    },
    onSuccess: () => {
      addToast("Task deleted");
      router.push(backHref);
    },
    onError: () => {
      addToast("Failed to delete task", "error");
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", workspaceId, taskId] });
      queryClient.invalidateQueries({ queryKey: ["task", workspaceId, taskId] });
      setCommentText("");
      addToast("Comment added");
    },
    onError: () => {
      addToast("Failed to add comment", "error");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/tasks/${taskId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", workspaceId, taskId] });
      addToast("Comment deleted");
    },
    onError: () => {
      addToast("Failed to delete comment", "error");
    },
  });

  const startEditing = () => {
    if (!task) return;
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditStatusId(task.statusId);
    setIsEditing(true);
  };

  const saveEdit = () => {
    if (!editTitle.trim()) return;
    updateTaskMutation.mutate({
      title: editTitle.trim(),
      description: editDescription.trim() === "" ? null : editDescription.trim(),
      statusId: editStatusId,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const comments = allComments;

  if (isLoading || !task) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
        <Link
          href={backHref}
          className="text-ink/40 hover:text-ink transition-colors duration-150"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <span className="text-sm text-ink/40">Back to tasks</span>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {isEditing ? (
            <div className="space-y-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-xl font-bold text-ink bg-transparent outline-none border-b-2 border-primary focus:border-primary"
                placeholder="Task title"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full text-sm text-ink/70 bg-transparent outline-none resize-none border border-gray-200 rounded-xl p-3 focus:border-primary"
                rows={4}
                placeholder="Description (optional)"
              />
              <div>
                <label className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Status</label>
                <select
                  value={editStatusId}
                  onChange={(e) => setEditStatusId(e.target.value)}
                  className="block mt-1 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-ink focus:outline-none focus:border-primary cursor-pointer"
                >
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={saveEdit}
                  disabled={updateTaskMutation.isPending}
                  className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                >
                  {updateTaskMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-sm text-ink/50 hover:text-ink px-3 py-2 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-ink">{task.title}</h1>
                  {task.description && (
                    <p className="text-sm text-ink/60 mt-2 whitespace-pre-wrap">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={startEditing}
                    className="text-sm text-ink/50 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150 cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this task? This cannot be undone.")) {
                        deleteTaskMutation.mutate();
                      }
                    }}
                    className="text-sm text-ink/50 hover:text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors duration-150 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-ink/50">
                <span className="inline-flex items-center bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium">
                  {task.status.name}
                </span>
                <span>Created by {task.createdBy.name}</span>
                <span>{formatDate(task.createdAt)}</span>
              </div>
            </div>
          )}

          {/* Comments section */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <h2 className="text-base font-semibold text-ink mb-4">
              Comments {comments.length > 0 && `(${comments.length})`}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (commentText.trim()) {
                  addCommentMutation.mutate(commentText.trim());
                }
              }}
              className="mb-6"
            >
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:border-primary transition-colors duration-150"
                rows={3}
                maxLength={5000}
              />
              {commentText.length > 4500 && (
                <p className={`text-xs mt-1 text-right ${
                  commentText.length > 5000 ? "text-red-500" : "text-ink/40"
                }`}>
                  {commentText.length}/5000
                </p>
              )}
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                >
                  {addCommentMutation.isPending ? "Posting..." : "Comment"}
                </button>
              </div>
            </form>

            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cta/10 text-cta flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {comment.author.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-ink">{comment.author.name}</span>
                      <span className="text-xs text-ink/40">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-sm text-ink/70 mt-1 whitespace-pre-wrap">{comment.text}</p>
                    {comment.author.id === userId && (
                      <button
                        onClick={() => {
                          deleteCommentMutation.mutate(comment.id);
                        }}
                        className="text-xs text-ink/30 hover:text-red-500 mt-1 cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-sm text-ink/30 text-center py-4">No comments yet. Be the first to comment.</p>
              )}
              {hasMoreComments && (
                <button
                  onClick={loadMoreComments}
                  className="text-sm text-primary hover:text-primary-dark font-medium cursor-pointer mt-2"
                >
                  Load more comments
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster toasts={toasts} />
    </div>
  );
}