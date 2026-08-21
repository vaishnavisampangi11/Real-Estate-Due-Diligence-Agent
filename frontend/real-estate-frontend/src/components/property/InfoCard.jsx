import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function InfoCard({
  title,
  subtitle,
  icon: Icon,
  children,
  action,
  collapsible = false,
  defaultOpen = true,
  variant = "default", // "blue", "green", "amber", "purple", "cyan", "red", "gray", "default"
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const cardVariants = {
    blue: "bg-blue-50/40 dark:bg-[#1E293B] border-blue-200/80 dark:border-[#334155] text-blue-950 dark:text-[#F8FAFC]",
    green: "bg-emerald-50/40 dark:bg-[#1E293B] border-emerald-200/80 dark:border-[#334155] text-emerald-950 dark:text-[#F8FAFC]",
    amber: "bg-amber-50/40 dark:bg-[#1E293B] border-amber-200/80 dark:border-[#334155] text-amber-950 dark:text-[#F8FAFC]",
    purple: "bg-purple-50/40 dark:bg-[#1E293B] border-purple-200/80 dark:border-[#334155] text-purple-950 dark:text-[#F8FAFC]",
    cyan: "bg-cyan-50/40 dark:bg-[#1E293B] border-cyan-200/80 dark:border-[#334155] text-cyan-950 dark:text-[#F8FAFC]",
    red: "bg-rose-50/40 dark:bg-[#1E293B] border-rose-200/80 dark:border-[#334155] text-rose-950 dark:text-[#F8FAFC]",
    gray: "bg-slate-50/60 dark:bg-[#1E293B] border-slate-200/80 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC]",
    default: "bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC]",
  };

  const iconVariants = {
    blue: "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-400 border-blue-200 dark:border-blue-800",
    green: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    amber: "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    purple: "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    cyan: "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
    red: "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    gray: "bg-slate-200 dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 border-slate-300 dark:border-[#334155]",
    default: "bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 border-blue-100 dark:border-blue-800",
  };

  return (
    <div
      className={`rounded-2xl p-6 lg:p-8 border shadow-xs transition-all duration-200 ${
        cardVariants[variant] || cardVariants.default
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                iconVariants[variant] || iconVariants.default
              }`}
            >
              <Icon size={18} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              {title}
            </h2>
            {subtitle && <p className="text-xs opacity-75 text-slate-500 dark:text-[#94A3B8] mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {action}
          {collapsible && (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1.5 rounded-lg bg-white/80 dark:bg-[#0F172A] hover:bg-white dark:hover:bg-[#1E293B] text-slate-600 dark:text-slate-200 border border-slate-200/80 dark:border-[#334155] transition-colors cursor-pointer"
            >
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {(!collapsible || isOpen) && <div>{children}</div>}
    </div>
  );
}

export default InfoCard;