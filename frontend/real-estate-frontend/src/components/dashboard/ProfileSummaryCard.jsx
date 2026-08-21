import React from "react";
import { useNavigate } from "react-router-dom";
import { User, ShieldCheck, Mail, Edit3, ArrowRight } from "lucide-react";

function ProfileSummaryCard({ userName, userRole }) {
  const navigate = useNavigate();

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-md shrink-0">
          RC
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
            {userName}
          </h3>
          <p className="text-xs font-semibold text-slate-500 dark:text-[#CBD5E1] truncate">
            {userRole}
          </p>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            <ShieldCheck size={12} /> Verified Auditor
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#334155]">
        <div className="flex justify-between text-xs font-bold">
          <span className="text-slate-500 dark:text-[#94A3B8]">Profile Completion</span>
          <span className="text-blue-600 dark:text-cyan-400">72%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 w-[72%]" />
        </div>
      </div>

      <button
        onClick={() => navigate("/profile")}
        className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#1E293B] text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-[#334155] transition-colors cursor-pointer"
      >
        <Edit3 size={14} />
        Manage Profile Settings
      </button>
    </div>
  );
}

export default ProfileSummaryCard;
