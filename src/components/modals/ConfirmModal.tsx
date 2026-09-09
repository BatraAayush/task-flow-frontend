import React, { useEffect } from "react";
import { AlertTriangle, Info, Loader2 } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <AlertTriangle className="w-5 h-5 text-rose-400" />,
      iconBox: "bg-rose-500/10 border-rose-500/20",
      button: "bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500",
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      iconBox: "bg-amber-500/10 border-amber-500/20",
      button: "bg-amber-600 hover:bg-amber-500 text-white focus:ring-amber-500",
    },
    primary: {
      icon: <Info className="w-5 h-5 text-indigo-400" />,
      iconBox: "bg-indigo-500/10 border-indigo-500/20",
      button: "bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500",
    },
  }[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0"
        onClick={() => !isLoading && onClose()}
      />

      <div className="relative w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl z-10">
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-lg border shrink-0 ${variantStyles.iconBox}`}>
            {variantStyles.icon}
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 ${variantStyles.button}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};