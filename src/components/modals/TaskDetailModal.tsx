import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Clock,
  History,
  Loader2,
  MessageSquare,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  updateTaskDetailsApi,
  deleteTaskApi,
  fetchTaskComments,
  addCommentApi,
} from "../../store/slices/taskSlice";
import type { TaskPriority } from "../../types";

interface TaskDetailModalProps {
  taskId: string;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const task = useAppSelector((state) =>
    state.tasks.tasks.find((t) => t._id === taskId),
  );
  const { comments, isCommentsLoading } = useAppSelector(
    (state) => state.tasks,
  );
  const { currentProject } = useAppSelector((state) => state.projects);

  const [activeTab, setActiveTab] = useState<"comments" | "activity">(
    "comments",
  );
  const [commentInput, setCommentInput] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Editable fields
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority || "medium",
  );
  const [assignedTo, setAssignedTo] = useState<string>(
    task?.assignedTo?._id || "",
  );
  const [dueDate, setDueDate] = useState<string>(
    task?.dueDate ? task.dueDate.split("T")[0] : "",
  );

  useEffect(() => {
    if (taskId) {
      dispatch(fetchTaskComments(taskId));
    }
  }, [taskId, dispatch]);

  if (!task) return null;

  const handleUpdate = async (fieldUpdate: Record<string, any>) => {
    try {
      await dispatch(
        updateTaskDetailsApi({
          taskId,
          data: fieldUpdate,
        }),
      ).unwrap();
      toast.success("Task updated");
    } catch (err: any) {
      toast.error("Failed to update task");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      setIsPostingComment(true);
      await dispatch(
        addCommentApi({ taskId, content: commentInput.trim() }),
      ).unwrap();
      setCommentInput("");
      toast.success("Comment posted");
    } catch (err: any) {
      toast.error("Failed to post comment");
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      setIsDeleting(true);
      await dispatch(deleteTaskApi(taskId)).unwrap();
      toast.success("Task deleted");
      onClose();
    } catch (err: any) {
      toast.error("Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 bg-slate-800 rounded-md text-slate-300">
              {task.status.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteTask}
              disabled={isDeleting}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title Edit */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (title !== task.title) handleUpdate({ title });
              }}
              className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none w-full pb-1 transition-all"
            />
          </div>

          {/* Properties Meta Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Priority
              </span>
              <select
                value={priority}
                onChange={(e) => {
                  const val = e.target.value as TaskPriority;
                  setPriority(val);
                  handleUpdate({ priority: val });
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Assignee
              </span>
              <select
                value={assignedTo}
                onChange={(e) => {
                  const val = e.target.value;
                  setAssignedTo(val);
                  handleUpdate({ assignedTo: val || null });
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
              >
                <option value="">Unassigned</option>
                {currentProject?.members?.map((m) => (
                  <option key={m.user._id} value={m.user._id}>
                    {m.user.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Due Date
              </span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setDueDate(val);
                  handleUpdate({ dueDate: val || null });
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={() => {
                if (description !== task.description)
                  handleUpdate({ description });
              }}
              placeholder="Add description..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition-all"
            />
          </div>

          {/* Tab Navigation: Comments & Activity Log */}
          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center gap-4 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("comments")}
                className={`flex items-center gap-1.5 pb-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === "comments"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comments ({comments.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("activity")}
                className={`flex items-center gap-1.5 pb-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === "activity"
                    ? "border-indigo-500 text-indigo-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Activity History ({task.activityLogs?.length || 0})</span>
              </button>
            </div>

            {/* Comments Tab Pane */}
            {activeTab === "comments" ? (
              <div className="space-y-4">
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isPostingComment || !commentInput.trim()}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    {isPostingComment ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                  </button>
                </form>

                <div className="space-y-3 pt-2">
                  {isCommentsLoading ? (
                    <div className="py-4 text-center text-xs text-slate-500">
                      Loading comments...
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-500 italic">
                      No comments yet. Start the discussion!
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-slate-200">
                            {comment.author?.name || "Member"}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(comment.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Activity History Tab Pane */
              <div className="space-y-2.5">
                {task.activityLogs && task.activityLogs.length > 0 ? (
                  task.activityLogs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2.5 text-xs text-slate-400 py-1.5 border-l-2 border-slate-800 pl-3 ml-1.5"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                      <div>
                        <p className="text-slate-300">{log.action}</p>
                        <span className="text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-500 italic">
                    No activity recorded yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
