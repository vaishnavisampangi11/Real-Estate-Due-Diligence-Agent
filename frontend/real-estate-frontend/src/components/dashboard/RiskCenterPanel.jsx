import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ShieldAlert,
  Scale,
  Waves,
  DollarSign,
  FileCheck,
  Building,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";

function ProgressRing({ percentage, strokeColor }) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg className="w-14 h-14 transform -rotate-90">
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          className="text-slate-200 dark:text-slate-800"
          fill="transparent"
        />
        <motion.circle
          cx="28"
          cy="28"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          className={strokeColor}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute font-mono text-[11px] font-black text-slate-800 dark:text-white">
        {percentage}%
      </span>
    </div>
  );
}

function RiskCenterPanel() {
  const navigate = useNavigate();

  const riskVectors = [
    {
      id: "legal",
      title: "Legal Risk",
      percentage: 12,
      riskLevel: "Low Risk",
      description: "Encumbrance check, easement restrictions, and deed title chain integrity.",
      icon: Scale,
      color: "text-emerald-500",
      progressColor: "text-emerald-500",
      bgColor: "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/40",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
    {
      id: "flood",
      title: "Flood Risk",
      percentage: 84,
      riskLevel: "High Risk",
      description: "FEMA Special Flood Hazard Area (SFHA) zone AE designation requiring flood insurance.",
      icon: Waves,
      color: "text-rose-500",
      progressColor: "text-rose-500",
      bgColor: "bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/40",
      badgeColor: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    },
    {
      id: "tax",
      title: "Tax Risk",
      percentage: 28,
      riskLevel: "Low Risk",
      description: "Municipal property tax assessments, delinquency records, and special tax district liens.",
      icon: DollarSign,
      color: "text-emerald-500",
      progressColor: "text-emerald-500",
      bgColor: "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/40",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
    {
      id: "ownership",
      title: "Ownership Risk",
      percentage: 18,
      riskLevel: "Clear Title",
      description: "Granular historical chain of title verification, grantor-grantee deed index.",
      icon: CheckCircle2,
      color: "text-blue-500",
      progressColor: "text-blue-500",
      bgColor: "bg-blue-50/60 dark:bg-blue-950/30 border-blue-200/80 dark:border-blue-900/40",
      badgeColor: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    },
    {
      id: "permits",
      title: "Permit Compliance",
      percentage: 58,
      riskLevel: "Medium Risk",
      description: "Building permit history, occupancy certificates, and open municipal violation notices.",
      icon: FileCheck,
      color: "text-amber-500",
      progressColor: "text-amber-500",
      bgColor: "bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-900/40",
      badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    },
    {
      id: "zoning",
      title: "Zoning Compliance",
      percentage: 15,
      riskLevel: "Compliant",
      description: "Land use ordinance compliance, floor-area ratios (FAR), and setback allowances.",
      icon: Building,
      color: "text-emerald-500",
      progressColor: "text-emerald-500",
      bgColor: "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/40",
      badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-[#334155]">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <ShieldAlert size={20} className="text-blue-600 dark:text-cyan-400" />
            Institutional Multi-Vector Risk Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Progress indicators for Legal, Flood, Tax, Ownership, Permits, and Zoning risk classifications.
          </p>
        </div>

        <button
          onClick={() => navigate("/risk-assessment")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
        >
          <span>View Full Risk Matrix</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Grid of 6 Risk Vector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {riskVectors.map((vec, idx) => {
          const IconC = vec.icon;
          return (
            <motion.div
              key={vec.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * idx }}
              whileHover={{ y: -3 }}
              onClick={() => navigate("/risk-assessment")}
              className={`p-5 rounded-2xl border ${vec.bgColor} shadow-sm hover:shadow-md transition-all cursor-pointer flex items-start gap-4 group`}
            >
              <ProgressRing percentage={vec.percentage} strokeColor={vec.progressColor} />

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {vec.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${vec.badgeColor}`}>
                    {vec.riskLevel}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-[#CBD5E1] line-clamp-2 leading-relaxed">
                  {vec.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default RiskCenterPanel;

