import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store";
import { logoutUser } from "../../store/slices/authSlice";
import { KanbanSquare, LogOut, User as UserIcon } from "lucide-react";
import { ConfirmModal } from "../modals/ConfirmModal";

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
    } catch {
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
      setIsLogoutOpen(false);
    }
  };

  return (
    <>
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="flex items-center gap-2 text-white font-bold text-lg"
            >
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <KanbanSquare className="w-5 h-5" />
              </div>
              <span>TaskFlow</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-semibold">
                  {user?.name ? (
                    user.name.charAt(0).toUpperCase()
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-sm font-medium text-slate-200 hidden sm:inline">
                  {user?.name || "User"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsLogoutOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/20 rounded-lg transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <ConfirmModal
        isOpen={isLogoutOpen}
        title="Confirm Logout"
        description="Are you sure you want to log out? Your active session will be cleared."
        confirmLabel="Log out"
        variant="danger"
        isLoading={isLoggingOut}
        onConfirm={handleLogout}
        onClose={() => setIsLogoutOpen(false)}
      />
    </>
  );
};
