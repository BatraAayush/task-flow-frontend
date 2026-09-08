import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { type ApiResponse, type IBoard, type IProject } from "../../types";
import api from "../../api/axiosInstance";

interface ProjectState {
  projects: IProject[];
  currentProject: IProject | null;
  boards: IBoard[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  boards: [],
  isLoading: false,
  error: null,
};

export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<ApiResponse<IProject[]>>("/projects");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.reason?.data?.message || "Failed to fetch projects",
      );
    }
  },
);

export const fetchProjectDetails = createAsyncThunk(
  "projects/fethDetails",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<
        ApiResponse<{ project: IProject; boards: IBoard[] }>
      >(`/projects/${projectId}`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.reason?.data?.message || "Failed to load project details",
      );
    }
  },
);

export const createProjectApi = createAsyncThunk(
  "projects/create",
  async (
    data: { title: string; description?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post<
        ApiResponse<{ project: IProject; boards: IBoard[] }>
      >(`/projects`, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.reason?.data?.message || "Failed to create project",
      );
    }
  },
);

export const updateProjectApi = createAsyncThunk(
  "projects/update",
  async (
    { projectId, data }: { projectId: string; data: Partial<IProject> },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.patch<ApiResponse<IProject>>(
        `/projects/${projectId}`,
        data,
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update project",
      );
    }
  },
);

export const deleteProjectApi = createAsyncThunk(
  "projects/delete",
  async (projectId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}`);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete project",
      );
    }
  },
);

export const inviteMemberApi = createAsyncThunk(
  "projects/inviteMember",
  async (
    {
      projectId,
      email,
      role = "member",
    }: { projectId: string; email: string; role?: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post<ApiResponse<IProject>>(
        `/projects/${projectId}/invite`,
        {
          email,
          role,
        },
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete project",
      );
    }
  },
);

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.boards = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = true;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchProjectDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProjectDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload.project;
        state.boards = action.payload.boards;
      })
      .addCase(fetchProjectDetails.rejected, (state, action) => {
        state.isLoading = true;
        state.error = action.payload as string;
      });

    builder.addCase(createProjectApi.fulfilled, (state, action) => {
      state.projects.unshift(action.payload.project);
    });

    builder.addCase(updateProjectApi.fulfilled, (state, action) => {
      state.currentProject = action.payload;
      const idx = state.projects.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) state.projects[idx] = action.payload;
    });

    builder.addCase(deleteProjectApi.fulfilled, (state, action) => {
      state.projects = state.projects.filter((p) => p._id === action.payload);
      if (state.currentProject?._id === action.payload) {
        ((state.currentProject = null), (state.boards = []));
      }
    });

    builder.addCase(inviteMemberApi.fulfilled, (state, action) => {
      state.currentProject = action.payload;
    });
  },
});

export const { clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
