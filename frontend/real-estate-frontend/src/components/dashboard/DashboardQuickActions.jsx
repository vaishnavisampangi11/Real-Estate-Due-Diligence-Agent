import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileText,
  TrendingUp,
  Bookmark,
  History,
  Upload,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { showToast } from "../../utils/swal";

function DashboardQuickActions({ onTriggerUpload }) {
  const navigate = useNavigate();

  const actions = [
    {
      id: "search",
      title: "Search Property",
      description: "Query land title records, APNs, addresses, and owner history.",
      icon: Search,
      path: "/property-search",
      badge: "Core Search",
      color: "from-blue-600 to-indigo-600",
      accent: "hover:border-blue-500",
    },
    {
      id: "generate-report",
      title: "Generate Due Diligence Report",
      description: "Create comprehensive 13-vector due diligence audit reports.",
      icon: FileText,
      path: "/due-diligence-report",
      badge: "Full Audit",
      color: "from-indigo-600 to-purple-600",
      accent: "hover:border-purple-500",
    },
    {
      id: "compare",
      title: "Compare Properties",
      description: "Benchmark regional market comps, square footage, & valuation.",
      icon: TrendingUp,
      path: "/comparable-properties",
      badge: "Market Intel",
      color: "from-cyan-600 to-blue-600",
      accent: "hover:border-cyan-500",
    },
    {
      id: "saved-props",
      title: "Saved Properties",
      description: "Access bookmarked real estate portfolio assets and profiles.",
      icon: Bookmark,
      path: "/profile",
      badge: "Portfolio",
      color: "from-emerald-600 to-teal-600",
      accent: "hover:border-emerald-500",
    },
    {
      id: "reports-history",
      title: "Reports Archival",
      description: "Review, filter, and export historical PDF/Excel reports.",
      icon: History,
      path: "/report-history",
      badge: "Archives",
      color: "from-slate-700 to-slate-900",
      accent: "hover:border-slate-400",
    },
    {
      id: "upload-doc",
      title: "Upload Documents",
      description: "Ingest land registry deeds, tax bills, and municipal permits.",
      icon: Upload,
      action: () => {
        if (onTriggerUpload) onTriggerUpload();
        else showToast("Document Ingestion Tool Ready - Select files to upload", "info");
      },
      badge: "Ingestion",
      color: "from-amber-600 to-orange-600",
      accent: "hover:border-amber-500",
    },
    {
      id: "risk-center",
      title: "Risk Center",
      description: "Analyze 0-100 risk scoring breakdown across legal & flood vectors.",
      icon: ShieldAlert,
      path: "/risk-assessment",
      badge: "Risk Matrix",
      color: "from-rose-600 to-red-600",
      accent: "hover:border-rose-500",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Sparkles size={20} className="text-blue-600 dark:text-cyan-400" />
            Quick Execution Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
            Instant single-click actions to launch property searches, audit reports, risk matrices, and document ingestions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {actions.map((act, index) => {
          const IconComp = act.icon;
          return (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 * index }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => {
                if (act.action) act.action();
                else if (act.path) navigate(act.path);
              }}
              className={`p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] ${act.accent} shadow-xs hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-3 group`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${act.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                    <IconComp size={18} />
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-cyan-400 border border-slate-200 dark:border-[#334155]">
                    {act.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-[#F8FAFC] group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors leading-tight">
                    {act.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] mt-1 line-clamp-2 leading-snug">
                    {act.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-cyan-400">
                <span>Launch</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default DashboardQuickActions;
