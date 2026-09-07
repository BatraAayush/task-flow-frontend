import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Crown,
  Edit3,
  Loader2,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UserPlus,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import {
  fetchProjectDetails,
  clearCurrentProject,
  deleteProjectApi,
} from "../store/slices/projectSlice";
import {
  fetchTasks,
  clearTasks,
  moveTaskOptimistic,
  updateTaskStatusApi,
  setFilters,
  resetFilters,
  setSelectedTaskId,
} from "../store/slices/taskSlice";
import { KanbanColumn } from "../components/board/KanbanColumn";
import { CreateTaskModal } from "../components/modals/CreateTaskModal";
import { TaskDetailModal } from "../components/modals/TaskDetailModal";
import { InviteMemberModal } from "../components/modals/InviteMemberModal";
import { EditProjectModal } from "../components/modals/EditProjectModal";
import { ConfirmDeleteModal } from "../components/modals/ConfirmDeleteModal";
import type { TaskStatus } from "../types";

export const ProjectBoard: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux Selectors
  const {
    currentProject,
    boards,
    isLoading: isProjectLoading,
  } = useAppSelector((state) => state.projects);
  const { tasks, filters, selectedTaskId } = useAppSelector(
    (state) => state.tasks,
  );
  const { user } = useAppSelector((state) => state.auth);

  // Local State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBoardForNewTask, setSelectedBoardForNewTask] = useState<
    string | null
  >(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  // Permissions
  const isOwner = currentProject?.owner?._id === user?._id;
  const currentMemberRecord = currentProject?.members?.find(
    (m) => m.user._id === user?._id,
  );
  const canInvite = isOwner || currentMemberRecord?.role === "admin";

  // Fetch project details and tasks on mount & clean up
  useEffect(() => {
    if (projectId) {
      dispatch(clearCurrentProject());
      dispatch(clearTasks());
      dispatch(resetFilters());

      dispatch(fetchProjectDetails(projectId));
      dispatch(fetchTasks({ projectId }));
    }

    return () => {
      dispatch(clearCurrentProject());
      dispatch(clearTasks());
      dispatch(resetFilters());
    };
  }, [projectId, dispatch]);

  // Handle individual filter updates
  const handleFilterUpdate = (
    key: keyof typeof filters,
    value: string | undefined,
  ) => {
    const nextFilters = {
      ...filters,
      [key]: value || undefined,
    };
    dispatch(setFilters(nextFilters));

    if (projectId) {
      dispatch(fetchTasks({ projectId, filters: nextFilters }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    handleFilterUpdate("search", val);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    dispatch(resetFilters());
    if (projectId) {
      dispatch(fetchTasks({ projectId }));
    }
  };

  const hasActiveFilters = Boolean(
    searchQuery || filters.status || filters.priority || filters.assignedTo,
  );

  // Client-side grouping by board ID with sorting & unassigned fallback
  const tasksByBoard = useMemo(() => {
    const acc: Record<string, typeof tasks> = {};
    boards.forEach((b) => {
      acc[b._id] = [];
    });

    const taskList = Array.isArray(tasks) ? tasks : [];

    taskList.forEach((task) => {
      if (filters.assignedTo === "unassigned" && task.assignedTo) {
        return;
      }
      if (acc[task.boardId]) {
        acc[task.boardId].push(task);
      }
    });

    Object.keys(acc).forEach((boardId) => {
      acc[boardId].sort((a, b) => a.orderIndex - b.orderIndex);
    });

    return acc;
  }, [boards, tasks, filters.assignedTo]);

  // Drag and Drop Handler
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const targetBoard = boards.find((b) => b._id === destination.droppableId);
    if (!targetBoard) return;

    let newStatus: TaskStatus = "todo";
    const lowerTitle = targetBoard.title.toLowerCase();
    if (lowerTitle.includes("progress")) newStatus = "in_progress";
    else if (lowerTitle.includes("done") || lowerTitle.includes("complete"))
      newStatus = "done";

    dispatch(
      moveTaskOptimistic({
        taskId: draggableId,
        targetBoardId: destination.droppableId,
        newStatus,
        newIndex: destination.index,
      }),
    );

    try {
      await dispatch(
        updateTaskStatusApi({
          taskId: draggableId,
          status: newStatus,
          boardId: destination.droppableId,
          orderIndex: destination.index,
        }),
      ).unwrap();
    } catch (err: any) {
      toast.error("Failed to sync task position with server");
      if (projectId) {
        dispatch(fetchTasks({ projectId, filters }));
      }
    }
  };

  // Confirm delete project execution
  const handleConfirmDelete = async () => {
    if (!projectId) return;

    try {
      setIsDeletingProject(true);
      const result = await dispatch(deleteProjectApi(projectId));
      if (deleteProjectApi.fulfilled.match(result)) {
        toast.success("Project deleted successfully");
        navigate("/");
      } else {
        toast.error((result.payload as string) || "Failed to delete project");
      }
    } finally {
      setIsDeletingProject(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isProjectLoading && !currentProject) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium">Loading project workspace...</p>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="text-center py-20">
        <h3 className="text-lg font-semibold text-white">Project not found</h3>
        <Link to="/" className="text-indigo-400 text-sm mt-2 inline-block">
          &larr; Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 pb-4 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Project Title & Owner Info */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  {currentProject.title}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Crown className="w-3 h-3" />
                  {currentProject.owner?.name || "Owner"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentProject.description || "Kanban Workspace"}
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Invite Member */}
            {canInvite && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Invite</span>
              </button>
            )}

            {/* Edit Project Details */}
            {(isOwner || currentMemberRecord?.role === "admin") && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium transition-colors"
                title="Edit Project Details"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            )}

            {/* Add Task Button */}
            <button
              onClick={() => setSelectedBoardForNewTask(boards[0]?._id || null)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>

            {/* Delete Project (Owner Only) */}
            {isOwner && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-rose-500/10 text-rose-400 border border-slate-800 rounded-lg text-xs font-medium transition-colors"
                title="Delete Workspace (Owner Only)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar: Search, Status, Priority, Assignee */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Text Search */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by title..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status || ""}
            onChange={(e) => handleFilterUpdate("status", e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority || ""}
            onChange={(e) => handleFilterUpdate("priority", e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={filters.assignedTo || ""}
            onChange={(e) => handleFilterUpdate("assignedTo", e.target.value)}
            className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {currentProject?.members?.map((m) => (
              <option key={m.user._id} value={m.user._id}>
                {m.user.name} ({m.role})
              </option>
            ))}
          </select>

          {/* Reset Filters Trigger */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 hover:border-rose-500/30 rounded-lg transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board Columns Canvas */}
      <div className="flex-1 overflow-x-auto py-5">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex items-start gap-5 h-full min-w-max pb-4">
            {boards.map((board) => (
              <KanbanColumn
                key={board._id}
                board={board}
                tasks={tasksByBoard[board._id] || []}
                onTaskClick={(taskId) => dispatch(setSelectedTaskId(taskId))}
                onAddTaskClick={(boardId) =>
                  setSelectedBoardForNewTask(boardId)
                }
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Create Task Modal */}
      {selectedBoardForNewTask && projectId && (
        <CreateTaskModal
          isOpen={!!selectedBoardForNewTask}
          boardId={selectedBoardForNewTask}
          projectId={projectId}
          onClose={() => setSelectedBoardForNewTask(null)}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => dispatch(setSelectedTaskId(null))}
        />
      )}

      {/* Invite Member Modal */}
      {projectId && (
        <InviteMemberModal
          isOpen={isInviteModalOpen}
          projectId={projectId}
          onClose={() => setIsInviteModalOpen(false)}
        />
      )}

      {/* Edit Project Modal */}
      {currentProject && (
        <EditProjectModal
          isOpen={isEditModalOpen}
          project={currentProject}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Custom Confirmation Modal for Delete Project */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        title="Delete Workspace"
        message="Are you sure you want to delete this project? All associated boards, tasks, and discussion comments will be permanently erased. This action cannot be undone."
        confirmText="Delete Project"
        isDeleting={isDeletingProject}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
