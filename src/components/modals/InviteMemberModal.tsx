import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Crown,
  Loader2,
  Shield,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { inviteMemberApi } from "../../store/slices/projectSlice";
import api from "../../api/axiosInstance";
import type { IUser, Role, ApiResponse } from "../../types";

interface InviteMemberModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  projectId,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { currentProject } = useAppSelector((state) => state.projects);

  const [selectedEmail, setSelectedEmail] = useState("");
  const [role, setRole] = useState<Role>("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [allUsers, setAllUsers] = useState<IUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    const loadPlatformUsers = async () => {
      if (!isOpen) return;
      try {
        setIsLoadingUsers(true);
        const response = await api.get<ApiResponse<IUser[]>>("/users");
        setAllUsers(response.data.data || []);
      } catch {
        setAllUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadPlatformUsers();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const currentMembers = currentProject?.members || [];
  const currentMemberIds = new Set(
    currentMembers.map((m) =>
      typeof m.user === "object" ? m.user?._id : m.user,
    ),
  );
  const ownerId =
    typeof currentProject?.owner === "object"
      ? currentProject?.owner?._id
      : currentProject?.owner;

  const availableUsersToInvite = allUsers.filter(
    (u) => !currentMemberIds.has(u._id) && u._id !== ownerId,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmail) {
      toast.error("Please select a user to invite");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await dispatch(
        inviteMemberApi({ projectId, email: selectedEmail, role }),
      );

      if (inviteMemberApi.fulfilled.match(result)) {
        toast.success(`User invited as ${role}`);
        setSelectedEmail("");
        setRole("member");
      } else {
        toast.error((result.payload as string) || "Failed to invite user");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] flex flex-col cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-white font-semibold">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <span>Manage Team Members</span>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 space-y-5 pt-5 pr-1">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-400" />
                Select Member to Invite
              </label>

              {isLoadingUsers ? (
                <div className="flex items-center gap-2 text-xs text-slate-400 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Loading platform users...</span>
                </div>
              ) : availableUsersToInvite.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl border border-slate-800/60">
                  All platform users are already members of this project.
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <select
                      value={selectedEmail}
                      onChange={(e) => setSelectedEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="">-- Choose a user --</option>
                      {availableUsersToInvite.map((u) => (
                        <option key={u._id} value={u.email}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="relative sm:w-32">
                    <Shield className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as Role)}
                      className="w-full pl-8 pr-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedEmail}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Invite"
                    )}
                  </button>
                </div>
              )}
            </div>
          </form>

          {/* Members List */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Current Project Members ({currentMembers.length})
              </span>
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {currentMembers.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 italic bg-slate-950/40 rounded-xl border border-slate-800/50">
                  No members yet.
                </div>
              ) : (
                currentMembers.map((member) => {
                  const isProjectOwner =
                    member?.user?._id === ownerId || member?.role === "owner";

                  return (
                    <div
                      key={member?.user?._id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {member?.user?.name ? (
                            member?.user?.name?.charAt(0)?.toUpperCase()
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-medium text-slate-200 truncate">
                            {member?.user?.name ?? "NA"}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {member?.user?.email ?? "NA"}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 ml-2">
                        {isProjectOwner ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Crown className="w-3 h-3" />
                            Owner
                          </span>
                        ) : (
                          <span
                            className={`inline-flex items-center text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border ${
                              member?.role === "admin"
                                ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                                : "bg-slate-800/80 text-slate-400 border-slate-700"
                            }`}
                          >
                            {member?.role}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
