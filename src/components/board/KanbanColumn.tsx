import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus } from "lucide-react";
import type { IBoard, ITask } from "../../types";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  board: IBoard;
  tasks: ITask[];
  onTaskClick: (taskId: string) => void;
  onAddTaskClick: (boardId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  board,
  tasks,
  onTaskClick,
  onAddTaskClick,
}) => {
  return (
    <div className="flex flex-col flex-shrink-0 w-80 bg-slate-950/60 border border-slate-800/80 rounded-2xl max-h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white tracking-wide">
            {board.title}
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-full text-slate-400">
            {tasks.length}
          </span>
        </div>

        <button
          onClick={() => onAddTaskClick(board._id)}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          title="Add task to this column"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Task Container */}
      <Droppable droppableId={board._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 overflow-y-auto space-y-2.5 min-h-[150px] transition-colors rounded-b-2xl ${
              snapshot.isDraggingOver ? "bg-indigo-950/20" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task._id)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};
