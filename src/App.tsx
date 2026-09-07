import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAppDispatch } from "./store";
import { checkAuthSession } from "./store/slices/authSlice";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { Navbar } from "./components/layout/Navbar";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { ProjectBoard } from "./pages/ProjectBoard";

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  // Attempt silent authentication recovery on mount
  useEffect(() => {
    dispatch(checkAuthSession());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            border: "1px solid #1e293b",
          },
        }}
      />

      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <div className="min-h-screen bg-slate-950 flex flex-col">
                <Navbar />
                <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                  <Dashboard />
                </main>
              </div>
            }
          />
          <Route
            path="/project/:projectId"
            element={
              <div className="min-h-screen bg-slate-950 flex flex-col">
                <Navbar />
                <main className="flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8">
                  <ProjectBoard />
                </main>
              </div>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
