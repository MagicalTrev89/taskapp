"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toast";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

interface Status {
  id: string;
  name: string;
  position: number;
}

export function SettingsClient({
  workspaceId,
  workspaceName,
  userId,
  isOwner,
}: {
  workspaceId: string;
  workspaceName: string;
  userId: string;
  isOwner: boolean;
}) {
  const queryClient = useQueryClient();
  const { toasts, addToast } = useToast();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"members" | "statuses">("members");
  const [inviteEmail, setInviteEmail] = useState("");
  const [newStatusName, setNewStatusName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [migrateTo, setMigrateTo] = useState<string>("");

  // Members
  const { data: membersData, isLoading: loadingMembers } = useQuery<{
    members: Member[];
    invitations: Invitation[];
  }>({
    queryKey: ["members", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
  });

  // Statuses
  const { data: statuses = [], isLoading: loadingStatuses } = useQuery<Status[]>({
    queryKey: ["statuses", workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/statuses`);
      if (!res.ok) throw new Error("Failed to fetch statuses");
      return res.json();
    },
  });

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to invite");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
      setInviteEmail("");
      addToast("Invitation sent");
    },
    onError: (err: Error) => {
      addToast(err.message || "Failed to invite", "error");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/members?userId=${targetUserId}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove member");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
      addToast("Member removed");
    },
    onError: (err: Error) => {
      addToast(err.message || "Failed to remove member", "error");
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/invitations/${invitationId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel invitation");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", workspaceId] });
      addToast("Invitation cancelled");
    },
    onError: (err: Error) => {
      addToast(err.message || "Failed to cancel invitation", "error");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/leave`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to leave workspace");
      }
    },
    onSuccess: () => {
      router.push("/");
    },
    onError: (err: Error) => {
      addToast(err.message || "Failed to leave workspace", "error");
    },
  });

  const addStatusMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/statuses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses", workspaceId] });
      addToast("Status added");
    },
    onError: (err: Error) => {
      addToast(err.message || "Failed to add status", "error");
    },
  });

  const renameStatusMutation = useMutation({
    mutationFn: async ({ statusId, name }: { statusId: string; name: string }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/statuses/${statusId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to rename status");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses", workspaceId] });
      setEditingId(null);
      addToast("Status renamed");
    },
    onError: (err: Error) => {
      addToast(err.message || "Failed to rename status", "error");
    },
  });

  const deleteStatusMutation = useMutation({
    mutationFn: async ({ statusId, targetStatusId }: { statusId: string; targetStatusId?: string }) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/statuses/${statusId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetStatusId ? { targetStatusId } : {}),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete status");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      setDeletingId(null);
      addToast("Status deleted");
    },
    onError: (err: Error) => {
      addToast(err.message || "Failed to delete status", "error");
    },
  });

  const reorderStatusesMutation = useMutation({
    mutationFn: async (statusIds: string[]) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/statuses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusIds }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reorder statuses");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["statuses", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", workspaceId] });
      addToast("Statuses reordered");
    },
    onError: (err: Error) => {
      addToast(err.message || "Failed to reorder statuses", "error");
    },
  });

  const members = membersData?.members ?? [];
  const invitations = membersData?.invitations ?? [];

  const handleDeleteStatus = (statusId: string) => {
    if (statuses.length <= 1) return;
    if (statuses.length === 2) {
      deleteStatusMutation.mutate({ statusId });
    } else {
      setMigrateTo(statuses.find((s) => s.id !== statusId)?.id ?? "");
      setDeletingId(statusId);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-100 bg-white">
        <h1 className="text-lg font-bold text-ink">Settings</h1>
        <div className="flex gap-1 mt-3">
          <button
            onClick={() => setActiveTab("members")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer ${
              activeTab === "members"
                ? "bg-primary/10 text-primary"
                : "text-ink/50 hover:bg-gray-100"
            }`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab("statuses")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 cursor-pointer ${
              activeTab === "statuses"
                ? "bg-primary/10 text-primary"
                : "text-ink/50 hover:bg-gray-100"
            }`}
          >
            Statuses
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === "members" ? (
          <div className="max-w-2xl">
            {isOwner && (
              <div className="mb-8">
                <h2 className="text-base font-semibold text-ink mb-3">Invite Member</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inviteEmail.trim()) inviteMutation.mutate(inviteEmail.trim());
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={!inviteEmail.trim() || inviteMutation.isPending}
                    className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                  >
                    {inviteMutation.isPending ? "Sending..." : "Invite"}
                  </button>
                </form>
              </div>
            )}

            {invitations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-base font-semibold text-ink mb-3">Pending Invitations</h2>
                <div className="space-y-2">
                  {invitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink">{inv.email}</p>
                        <p className="text-xs text-ink/40">
                          Invited {new Date(inv.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          Pending
                        </span>
                        {isOwner && (
                          <button
                            onClick={() => {
                              if (confirm(`Cancel invitation to ${inv.email}?`)) {
                                cancelInvitationMutation.mutate(inv.id);
                              }
                            }}
                            disabled={cancelInvitationMutation.isPending}
                            className="text-xs text-red-400 hover:text-red-600 cursor-pointer disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-base font-semibold text-ink mb-3">
                Members ({members.length})
              </h2>
              {loadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {member.user.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{member.user.name}</p>
                          <p className="text-xs text-ink/40">{member.user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            member.role === "OWNER"
                              ? "bg-cta/10 text-cta"
                              : "bg-gray-100 text-ink/50"
                          }`}
                        >
                          {member.role === "OWNER" ? "Owner" : "Member"}
                        </span>
                        {isOwner && member.user.id !== userId && member.role !== "OWNER" && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${member.user.name} from this workspace?`)) {
                                removeMemberMutation.mutate(member.user.id);
                              }
                            }}
                            className="text-xs text-red-400 hover:text-red-600 px-2 py-1 cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!isOwner && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={() => {
                    if (confirm(`Leave "${workspaceName}"? You will lose access to all tasks in this workspace.`)) {
                      leaveMutation.mutate();
                    }
                  }}
                  disabled={leaveMutation.isPending}
                  className="text-sm text-red-500 hover:text-red-700 font-medium cursor-pointer disabled:opacity-50"
                >
                  {leaveMutation.isPending ? "Leaving..." : "Leave Workspace"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl">
            {isOwner ? (
              <>
                <div className="mb-6">
                  <h2 className="text-base font-semibold text-ink mb-3">Add Status</h2>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newStatusName.trim()) {
                        addStatusMutation.mutate(newStatusName.trim());
                        setNewStatusName("");
                      }
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={newStatusName}
                      onChange={(e) => setNewStatusName(e.target.value)}
                      placeholder="Status name"
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary"
                      maxLength={50}
                    />
                    <button
                      type="submit"
                      disabled={!newStatusName.trim() || addStatusMutation.isPending}
                      className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors duration-150 disabled:opacity-50 cursor-pointer"
                    >
                      Add
                    </button>
                  </form>
                  {statuses.length >= 20 && (
                    <p className="text-xs text-ink/40 mt-2">Maximum of 20 statuses reached.</p>
                  )}
                </div>

                <h2 className="text-base font-semibold text-ink mb-3">
                  Current Statuses ({statuses.length})
                </h2>

                {loadingStatuses ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  <SortableStatusList
                    statuses={[...statuses].sort((a, b) => a.position - b.position)}
                    editingId={editingId}
                    editName={editName}
                    setEditName={setEditName}
                    setEditingId={setEditingId}
                    renameStatusMutation={renameStatusMutation}
                    deleteStatusMutation={deleteStatusMutation}
                    handleDeleteStatus={handleDeleteStatus}
                    statusesLength={statuses.length}
                    reorderStatusesMutation={reorderStatusesMutation}
                  />
                )}

                {/* Delete confirmation dialog */}
                {deletingId && (
                  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
                      <h3 className="text-base font-semibold text-ink mb-2">Delete Status</h3>
                      <p className="text-sm text-ink/60 mb-4">
                        What should happen to tasks currently in this status?
                      </p>
                      {statuses.filter((s) => s.id !== deletingId).length > 1 && (
                        <div className="mb-4">
                          <label className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
                            Move tasks to:
                          </label>
                          <select
                            value={migrateTo}
                            onChange={(e) => setMigrateTo(e.target.value)}
                            className="block mt-1 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary cursor-pointer"
                          >
                            {statuses
                              .filter((s) => s.id !== deletingId)
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setDeletingId(null)}
                          className="text-sm text-ink/50 hover:text-ink px-4 py-2 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            deleteStatusMutation.mutate({
                              statusId: deletingId,
                              targetStatusId: migrateTo || undefined,
                            });
                          }}
                          disabled={deleteStatusMutation.isPending}
                          className="text-sm font-medium bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-ink/50">Only workspace owners can manage statuses.</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Toaster toasts={toasts} />
    </div>
  );
}

function SortableStatusItem({
  status,
  editingId,
  editName,
  setEditName,
  setEditingId,
  renameStatusMutation,
  handleDeleteStatus,
  statusesLength,
}: {
  status: Status;
  editingId: string | null;
  editName: string;
  setEditName: (name: string) => void;
  setEditingId: (id: string | null) => void;
  renameStatusMutation: { mutate: (vars: { statusId: string; name: string }) => void; isPending: boolean };
  handleDeleteStatus: (statusId: string) => void;
  statusesLength: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: status.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-ink/30 hover:text-ink/60 touch-none"
          aria-label="Drag to reorder"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
          </svg>
        </button>
        {editingId === status.id ? (
          <div className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 text-sm border border-primary rounded-lg px-3 py-1.5 focus:outline-none"
              autoFocus
            />
            <button
              onClick={() => {
                if (editName.trim()) {
                  renameStatusMutation.mutate({
                    statusId: status.id,
                    name: editName.trim(),
                  });
                }
              }}
              disabled={renameStatusMutation.isPending}
              className="text-sm font-medium bg-primary text-white px-3 py-1.5 rounded-lg cursor-pointer disabled:opacity-50"
            >
              Save
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="text-sm text-ink/50 px-2 py-1.5 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        ) : (
          <span className="text-sm font-medium text-ink">{status.name}</span>
        )}
      </div>
      {editingId !== status.id && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingId(status.id);
              setEditName(status.name);
            }}
            className="text-xs text-ink/40 hover:text-primary px-2 py-1 cursor-pointer"
          >
            Rename
          </button>
          {statusesLength > 1 && (
            <button
              onClick={() => handleDeleteStatus(status.id)}
              className="text-xs text-ink/40 hover:text-red-500 px-2 py-1 cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SortableStatusList({
  statuses,
  editingId,
  editName,
  setEditName,
  setEditingId,
  renameStatusMutation,
  deleteStatusMutation,
  handleDeleteStatus,
  statusesLength,
  reorderStatusesMutation,
}: {
  statuses: Status[];
  editingId: string | null;
  editName: string;
  setEditName: (name: string) => void;
  setEditingId: (id: string | null) => void;
  renameStatusMutation: { mutate: (vars: { statusId: string; name: string }) => void; isPending: boolean };
  deleteStatusMutation: { mutate: (vars: { statusId: string; targetStatusId?: string }) => void; isPending: boolean };
  handleDeleteStatus: (statusId: string) => void;
  statusesLength: number;
  reorderStatusesMutation: { mutate: (vars: string[]) => void; isPending: boolean };
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = statuses.findIndex((s) => s.id === active.id);
    const newIndex = statuses.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...statuses];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    reorderStatusesMutation.mutate(reordered.map((s) => s.id));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={statuses.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2">
          {statuses.map((status) => (
            <SortableStatusItem
              key={status.id}
              status={status}
              editingId={editingId}
              editName={editName}
              setEditName={setEditName}
              setEditingId={setEditingId}
              renameStatusMutation={renameStatusMutation}
              handleDeleteStatus={handleDeleteStatus}
              statusesLength={statusesLength}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}