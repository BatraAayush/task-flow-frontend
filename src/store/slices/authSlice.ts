import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { type ApiResponse, type IUser } from "../../types";
import api, { setApiAccessToken } from "../../api/axiosInstance";

interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialAuthChecking: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialAuthChecking: true,
  error: null,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    formData: { name: string; email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post<
        ApiResponse<{ user: IUser; accessToken: string }>
      >("/auth/register", formData);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Registration failed",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    formData: { email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await api.post<
        ApiResponse<{ user: IUser; accessToken: string }>
      >("/auth/login", formData);
      return response.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  },
);

export const checkAuthSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const refreshRes =
        await api.post<ApiResponse<{ accessToken: string }>>("/auth/refresh");
      const { accessToken } = refreshRes.data.data;
      setApiAccessToken(accessToken);

      const userRes = await api.get<ApiResponse<IUser>>("/auth/me");
      return { user: userRes.data.data, accessToken };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: IUser; accessToken: string }>,
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      setApiAccessToken(action.payload.accessToken);
    },
    clearAuth: (state) => {
      state.user = null;
      ((state.accessToken = null),
        (state.isAuthenticated = false),
        (state.isLoading = false));
      ((state.isInitialAuthChecking = true), (state.error = null));
      setApiAccessToken(null);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        setApiAccessToken(action.payload.accessToken);
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        setApiAccessToken(action.payload.accessToken);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.error = null;
      setApiAccessToken(null);
    });

    builder
      .addCase(checkAuthSession.pending, (state) => {
        state.isInitialAuthChecking = true;
      })
      .addCase(checkAuthSession.fulfilled, (state, action) => {
        state.isInitialAuthChecking = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        setApiAccessToken(action.payload.accessToken);
      })
      .addCase(checkAuthSession.rejected, (state) => {
        state.isInitialAuthChecking = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      });
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
