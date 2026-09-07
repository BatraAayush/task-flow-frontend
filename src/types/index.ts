export type Role = "owner" | "admin" | "member";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProjectMember {
  user: IUser;
  role: Role;
}

export interface IBoard {
  _id: string;
  title: string;
  projectId: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface IActivityLog {
  user: IUser | string;
  action: string;
  timestamp: string;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  projectId: string;
  boardId: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: IUser | null;
  dueDate: string | null;
  orderIndex: number;
  activityLogs: IActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface IComment {
  _id: string;
  taskId: string;
  author: IUser;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProject {
  _id: string;
  title: string;
  description?: string;
  owner: IUser;
  members: IProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  search?: string;
}
