import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Crown,
  FolderKanban,
  FolderPlus,
  Layers,
  Loader2,
  Users,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchProjects } from "../store/slices/projectSlice";
import { CreateProjectModal } from "../components/dashboard/CreateProjectModal";

export const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { projects, isLoading } = useAppSelector((state) => state.projects);
  const { user } = useAppSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  return (
    <div className="space-y-8">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Workspace Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your collaborative projects and Kanban boards.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid Area */}
      {isLoading && projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
          <p className="text-sm font-medium">Loading your workspaces...</p>
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30 text-center">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 mb-4">
            <Layers className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-white">
            No projects found
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
            Get started by creating your first collaborative workspace and
            managing tasks.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Your First Project</span>
          </button>
        </div>
      ) : (
        /* Projects List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const ownerName =
              typeof project.owner === "object" && project.owner?.name
                ? project.owner.name
                : user?.name || "Owner";

            return (
              <Link
                key={project._id}
                to={`/project/${project._id}`}
                className="group flex flex-col justify-between p-5 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition-all shadow-sm hover:shadow-indigo-500/5 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <FolderKanban className="w-5 h-5" />
                    </div>

                    {/* Populated Owner Badge */}
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                      <Crown className="w-3 h-3 text-amber-400" />
                      <span className="truncate max-w-[120px]">
                        {ownerName}
                      </span>
                    </span>
                  </div>

                  <h2 className="text-base font-semibold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                    {project.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                    {project.description ||
                      "No description provided for this workspace."}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project.members?.length || 1} members</span>
                  </div>
                  <span>
                    {new Date(project.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal for Project Creation */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
