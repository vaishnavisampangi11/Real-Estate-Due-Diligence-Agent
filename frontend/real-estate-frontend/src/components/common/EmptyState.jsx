import React from "react";
import { FolderSearch, RotateCcw } from "lucide-react";
import Button from "./Button";

function EmptyState({
  title = "No Records Found",
  message = "Search a property address or adjust your filters to view due diligence results.",
  icon: CustomIcon,
  actionLabel,
  onAction,
  onRetry,
  retryLabel = "Retry Connection",
  className = "",
}) {
  const Icon = CustomIcon || FolderSearch;

  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 my-4 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shadow-xs mb-3.5">
        <Icon size={26} />
      </div>

      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1 leading-relaxed">{message}</p>

      <div className="flex items-center gap-3 mt-4">
        {onRetry && (
          <Button onClick={onRetry} variant="secondary" size="sm" icon={RotateCcw}>
            {retryLabel}
          </Button>
        )}
        {actionLabel && onAction && (
          <Button onClick={onAction} variant="primary" size="sm">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default EmptyState;