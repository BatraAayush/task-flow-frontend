import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import {
  Calendar,
  History,
  User as UserIcon,
} from "lucide-react";
import type { ITask, TaskPriority } from "../../types";

interface TaskCardProps {
  task: ITask;
  index: number;
  onClick: () => void;
}

const priorityBadgeStyles: Record<
  TaskPriority,
  { bg: string; text: string; border: string }
> = {
  low: {
    bg: "bg-slate-800/80",
    text: "text-slate-300",
    border: "border-slate-700",
  },
  medium: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  high: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  urgent: {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    border: "border-rose-500/20",
  },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onClick }) => {
  const priorityStyle =
    priorityBadgeStyles[task.priority] || priorityBadgeStyles.medium;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`p-3.5 bg-slate-900 border rounded-xl cursor-pointer transition-all shadow-sm select-none ${
            snapshot.isDragging
              ? "border-indigo-500 shadow-xl shadow-indigo-500/10 rotate-1 scale-[1.02] z-50 bg-slate-850"
              : "border-slate-800 hover:border-slate-700 hover:bg-slate-900/90"
          }`}
        >
          {/* Top meta tags */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${priorityStyle.bg} ${priorityStyle.text} ${priorityStyle.border}`}
            >
              {task.priority}
            </span>

            {task.dueDate && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-medium text-slate-100 line-clamp-2 leading-snug mb-2">
            {task.title}
          </h4>

          {/* Bottom row: Assignee & metadata badges */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              {task.assignedTo ? (
                <div
                  className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800"
                  title={task.assignedTo.name}
                >
                  <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px] font-bold">
                    {task.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate max-w-[80px] text-[11px] text-slate-300">
                    {task.assignedTo.name}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-500 italic flex items-center gap-1">
                  <UserIcon className="w-3 h-3" /> Unassigned
                </span>
              )}
            </div>

            {/* Audit & comment indicators */}
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              {task.activityLogs && task.activityLogs.length > 0 && (
                <span
                  className="flex items-center gap-0.5"
                  title="Activity logs"
                >
                  <History className="w-3 h-3" />
                  {task.activityLogs.length}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
