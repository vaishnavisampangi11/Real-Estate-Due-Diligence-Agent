import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  ShieldCheck,
  Award,
  Sparkles,
  FileCheck2,
  TrendingUp,
  UserCheck,
  FolderCheck,
  Map,
  Compass,
  Leaf,
  Receipt,
  FileText,
} from "lucide-react";
import Badge from "../common/Badge";
import { showSuccessAlert, showToast } from "../../utils/swal";

// The 7 Required Checklist Items with metadata & icons
const INITIAL_CHECKLIST = [
  {
    id: "chk-1",
    title: "Ownership Verified",
    description: "Sub-Registrar 30-year deed chain trace & Form 15 EC verified clear",
    completed: true,
    category: "Ownership",
    icon: UserCheck,
  },
  {
    id: "chk-2",
    title: "Legal Documents Verified",
    description: "Sale Deed, Title Deed, and Registration Certificate sealed by legal counsel",
    completed: true,
    category: "Vault",
    icon: FolderCheck,
  },
  {
    id: "chk-3",
    title: "Permit Verified",
    description: "GHMC Municipal Building Plan Sanction & Fire Safety NOC active",
    completed: true,
    category: "Permits",
    icon: Map,
  },
  {
    id: "chk-4",
    title: "Zoning Verified",
    description: "HMDA Master Plan 2031 FAR 3.5 & setback rules verified compliant",
    completed: true,
    category: "Zoning",
    icon: Compass,
  },
  {
    id: "chk-5",
    title: "Environmental Check Completed",
    description: "Pollution Control Board soil NOC & FIRM flood zone clearance verified",
    completed: true,
    category: "Environmental",
    icon: Leaf,
  },
  {
    id: "chk-6",
    title: "Tax Records Reviewed",
    description: "GHMC municipal property tax receipt verified 0 outstanding dues",
    completed: true,
    category: "Tax",
    icon: Receipt,
  },
  {
    id: "chk-7",
    title: "Final Recommendation Added",
    description: "Formal legal due diligence clearance verdict sealed for acquisition",
    completed: true,
    category: "Verdict",
    icon: FileText,
  },
];

function ReviewChecklist({ initialItems, propertyId = "1001", onCompleteChange }) {
  const [items, setItems] = useState(initialItems || INITIAL_CHECKLIST);

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  // Approval Status calculation
  const getApprovalStatus = () => {
    if (percentage === 100) return { label: "100% Fully Approved", variant: "success" };
    if (percentage >= 70) return { label: "Pending Final Signoff", variant: "warning" };
    return { label: "Audit In Progress", variant: "info" };
  };

  const status = getApprovalStatus();

  const handleToggleItem = (id) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );

      const newComp = updated.filter((i) => i.completed).length;
      const newPct = Math.round((newComp / totalCount) * 100);

      if (newPct === 100) {
        showSuccessAlert(
          "All Criteria Met!",
          "100% Legal Due Diligence Review Checklist completed & approved."
        );
      } else {
        showToast(`Checklist progress updated: ${newPct}%`, "info");
      }

      if (onCompleteChange) onCompleteChange(newPct, updated);
      return updated;
    });
  };

  return (
    <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6 font-mono text-xs">
      {/* Header with Title & Approval Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-[#334155] pb-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider block">
            LEGAL COMPLIANCE GATEWAY
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            <FileCheck2 size={22} className="text-blue-600 dark:text-cyan-400" />
            Review Checklist & Audit Gateways
          </h2>
        </div>

        {/* APPROVAL STATUS BADGE */}
        <div className="flex items-center gap-2">
          <Badge variant={status.variant} className="text-xs px-3 py-1 font-bold">
            {status.label}
          </Badge>
        </div>
      </div>

      {/* PROGRESS BAR & COMPLETION PERCENTAGE */}
      <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
        <div className="flex items-center justify-between font-bold">
          <span className="text-slate-700 dark:text-slate-300">Total Completion Progress</span>
          <span className="text-blue-600 dark:text-cyan-400 text-sm font-extrabold">{percentage}% Completed ({completedCount}/{totalCount})</span>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`h-full rounded-full transition-all ${
              percentage === 100
                ? "bg-gradient-to-r from-emerald-500 to-green-400"
                : percentage >= 70
                ? "bg-gradient-to-r from-blue-600 to-cyan-500"
                : "bg-gradient-to-r from-amber-500 to-orange-400"
            }`}
          />
        </div>
      </div>

      {/* CHECKLIST ITEMS LIST (THE 7 REQUIRED ITEMS) */}
      <div className="space-y-3">
        {items.map((item) => {
          const IconComp = item.icon || CheckCircle2;
          return (
            <motion.div
              key={item.id}
              whileHover={{ x: 3 }}
              onClick={() => handleToggleItem(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                item.completed
                  ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/80"
                  : "bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-[#334155]"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Checkbox Icon */}
                <div className={`p-1 rounded-lg shrink-0 ${
                  item.completed ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                }`}>
                  {item.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-extrabold text-xs ${
                      item.completed ? "text-slate-900 dark:text-white line-through opacity-85" : "text-slate-900 dark:text-white"
                    }`}>
                      {item.title}
                    </h3>
                    <span className="text-[9px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <Badge variant={item.completed ? "success" : "secondary"}>
                  {item.completed ? "Verified" : "Pending"}
                </Badge>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default ReviewChecklist;
