import React from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Droplets,
  Receipt,
  FileCheck,
  TrendingUp,
  BrainCircuit,
  CheckCircle2,
} from "lucide-react";

function AIInsightsPanel() {
  const insights = [
    {
      title: "Ownership Verification",
      value: "Clean Title Chain Verified",
      status: "Verified",
      icon: ShieldCheck,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60",
    },
    {
      title: "Flood Zone Status",
      value: "FEMA Zone X (Minimal Flood Risk)",
      status: "Low Risk",
      icon: Droplets,
      color: "text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60",
    },
    {
      title: "Tax Status",
      value: "Zero Municipal Delinquencies",
      status: "Compliant",
      icon: Receipt,
      color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60",
    },
    {
      title: "Permit Compliance",
      value: "All Commercial Permits Signed Off",
      status: "Passed",
      icon: FileCheck,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60",
    },
    {
      title: "Investment Recommendation",
      value: "Low Risk Profile • 94.2% Confidence Score",
      status: "Recommended",
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-4 relative overflow-hidden"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#334155]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xs">
            <BrainCircuit size={18} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              Automated AI Due Diligence Synthesis
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
              Consolidated intelligence matrix calculated across municipal datasets.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
          AI Agent V4.2
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((item, idx) => {
          const IconC = item.icon;
          return (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-[#0F172A]/70 border border-slate-200/60 dark:border-[#334155] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${item.color}`}>
                  <IconC size={16} />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-[#94A3B8] block">
                    {item.title}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 shrink-0">
                {item.status}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default AIInsightsPanel;
