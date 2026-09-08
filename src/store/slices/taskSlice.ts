import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../api/axiosInstance";
import type {
  ITask,
  IComment,
  TaskFilters,
  ApiResponse,
  TaskStatus,
} from "../../types";

interface TaskState {
  tasks: ITask[];
  comments: IComment[];
  selectedTaskId: string | null;
  filters: TaskFilters;
  isLoading: boolean;
  isCommentsLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  comments: [],
  selectedTaskId: null,
  filters: {},
  isLoading: false,
  isCommentsLoading: false,
  error: null,
};

// Async Thunks
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (
    { projectId, filters }: { projectId: string; filters?: TaskFilters },
    { rejectWithValue },
  ) => {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append("status", filters.status);
      if (filters?.priority) params.append("priority", filters.priority);
      if (filters?.assignedTo) params.append("assignedTo", filters.assignedTo);
      if (filters?.search) params.append("search", filters.search);

      const response = await api.get<ApiResponse<ITask[]>>(
        `/projects/${projectId}/tasks?${params.toString()}`,
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch tasks",
      );
    }
  },
);

export const createTaskApi = createAsyncThunk(
  "tasks/create",
  async (
    { projectId, data }: { projectId: string; data: Partial<ITask> },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post<ApiResponse<ITask>>(
        `/projects/${projectId}/tasks`,
        data,
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create task",
      );
    }
  },
);

export const updateTaskStatusApi = createAsyncThunk(
  "tasks/updateStatus",
  async (
    {
      taskId,
      status,
      boardId,
      orderIndex,
    }: {
      taskId: string;
      status: TaskStatus;
      boardId: string;
      orderIndex: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch<ApiResponse<ITask>>(
        `/tasks/${taskId}/status`,
        {
          status,
          boardId,
          orderIndex,
        },
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update task position",
      );
    }
  },
);

export const updateTaskDetailsApi = createAsyncThunk(
  "tasks/updateDetails",
  async (
    { taskId, data }: { taskId: string; data: Partial<ITask> },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch<ApiResponse<ITask>>(
        `/tasks/${taskId}`,
        data,
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update task",
      );
    }
  },
);

export const deleteTaskApi = createAsyncThunk(
  "tasks/delete",
  async (taskId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      return taskId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete task",
      );
    }
  },
);

export const fetchTaskComments = createAsyncThunk(
  "tasks/fetchComments",
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<IComment[]>>(
        `/tasks/${taskId}/comments`,
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comments",
      );
    }
  },
);

export const addCommentApi = createAsyncThunk(
  "tasks/addComment",
  async (
    { taskId, content }: { taskId: string; content: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post<ApiResponse<IComment>>(
        `/tasks/${taskId}/comments`,
        { content },
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to post comment",
      );
    }
  },
);

// src/store/slices/taskSlice.ts

export const updateCommentApi = createAsyncThunk(
  "tasks/updateComment",
  async (
    {
      taskId,
      commentId,
      content,
    }: { taskId: string; commentId: string; content: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch<ApiResponse<IComment>>(
        `/tasks/${taskId}/comments/${commentId}`,
        { content },
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update comment",
      );
    }
  },
);

export const deleteCommentApi = createAsyncThunk(
  "tasks/deleteComment",
  async (
    { taskId, commentId }: { taskId: string; commentId: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.delete<
        ApiResponse<{ commentId: string; task: ITask }>
      >(`/tasks/${taskId}/comments/${commentId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete comment",
      );
    }
  },
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTasks: (state) => {
      state.tasks = [];
      state.comments = [];
      state.selectedTaskId = null;
      state.error = null;
    },
    setSelectedTaskId: (state, action: PayloadAction<string | null>) => {
      state.selectedTaskId = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {};
    },
    // Optimistic drag and drop update
    moveTaskOptimistic: (
      state,
      action: PayloadAction<{
        taskId: string;
        targetBoardId: string;
        newStatus: TaskStatus;
        newIndex: number;
      }>,
    ) => {
      const { taskId, targetBoardId, newStatus, newIndex } = action.payload;
      const taskIndex = state.tasks.findIndex((t) => t._id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].boardId = targetBoardId;
        state.tasks[taskIndex].status = newStatus;
        state.tasks[taskIndex].orderIndex = newIndex;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        const payload: any = action.payload;

        // Handles both raw array response and wrapped/paginated { tasks: [...] }
        if (Array.isArray(payload)) {
          state.tasks = payload;
        } else if (Array.isArray(payload?.tasks)) {
          state.tasks = payload.tasks;
        } else {
          state.tasks = [];
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.tasks = []; // Fallback to empty array on failure
        state.error = action.payload as string;
      });

    // Create task
    builder.addCase(createTaskApi.fulfilled, (state, action) => {
      state.tasks.push(action.payload);
    });

    // Update task status / details
    builder.addCase(updateTaskDetailsApi.fulfilled, (state, action) => {
      const index = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    });

    // Delete task
    builder.addCase(deleteTaskApi.fulfilled, (state, action) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      if (state.selectedTaskId === action.payload) {
        state.selectedTaskId = null;
      }
    });

    // Comments
    builder
      .addCase(fetchTaskComments.pending, (state) => {
        state.isCommentsLoading = true;
      })
      .addCase(fetchTaskComments.fulfilled, (state, action) => {
        state.isCommentsLoading = false;
        state.comments = action.payload;
      })
      .addCase(fetchTaskComments.rejected, (state) => {
        state.isCommentsLoading = false;
      });

    // Inside extraReducers in taskSlice.ts

    builder.addCase(addCommentApi.fulfilled, (state, action) => {
      const payload: any = action.payload;

      // Handle both { comment, task } and direct comment payload
      const newComment = payload?.comment ? payload.comment : payload;
      const updatedTask = payload?.task;

      // 1. Append the populated comment
      if (newComment) {
        state.comments.push(newComment);
      }

      // 2. Sync the updated task with its new activity log into Redux state
      if (updatedTask) {
        const taskIndex = state.tasks.findIndex(
          (t) => t._id === updatedTask._id,
        );
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = updatedTask;
        }
      }
    });

    builder.addCase(updateCommentApi.fulfilled, (state, action) => {
      const payload: any = action.payload;
      const updatedComment = payload?.comment || payload;
      const updatedTask = payload?.task;

      if (updatedComment?._id) {
        const index = state.comments.findIndex(
          (c) => c._id === updatedComment._id,
        );
        if (index !== -1) {
          state.comments[index] = updatedComment;
        }
      }

      if (updatedTask?._id) {
        const taskIndex = state.tasks.findIndex(
          (t) => t._id === updatedTask._id,
        );
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = updatedTask;
        }
      }
    });

    builder.addCase(deleteCommentApi.fulfilled, (state, action) => {
      const payload: any = action.payload;
      const deletedId = payload?.commentId || payload;
      const updatedTask = payload?.task;

      state.comments = state.comments.filter((c) => c._id !== deletedId);

      if (updatedTask?._id) {
        const taskIndex = state.tasks.findIndex(
          (t) => t._id === updatedTask._id,
        );
        if (taskIndex !== -1) {
          state.tasks[taskIndex] = updatedTask;
        }
      }
    });

    builder.addCase(updateTaskStatusApi.fulfilled, (state, action) => {
      const updatedTask = action.payload;
      if (!updatedTask?._id) return;

      const index = state.tasks.findIndex((t) => t._id === updatedTask._id);
      if (index !== -1) {
        state.tasks[index] = updatedTask;
      }
    });
  },
});

export const {
  clearTasks,
  setSelectedTaskId,
  setFilters,
  resetFilters,
  moveTaskOptimistic,
} = taskSlice.actions;

export default taskSlice.reducer;
