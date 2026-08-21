import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Bookmark,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { getMyReports } from "../../services/reportService";
import { getLiveSavedProperties } from "../../services/liveStore";

function UserStatsGrid({ userRole = "Buyer", completionPercentage = 50 }) {
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Read real saved properties/watchlist
  const savedList = getLiveSavedProperties() || [];
  const savedCount = Array.isArray(savedList) ? savedList.length : 0;

  useEffect(() => {
    getMyReports()
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setReportCount(raw.length);
      })
      .catch(() => {
        setReportCount(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const stats = [
    {
      id: "account",
      title: "Account Status",
      count: "Active",
      subtext: `Verified ${userRole}`,
      icon: UserCheck,
      color: "from-blue-500/20 to-indigo-500/10 text-blue-600 dark:text-cyan-400 border-blue-200 dark:border-blue-800/40",
    },
    {
      id: "reports",
      title: "Reports Generated",
      count: loading ? "..." : String(reportCount),
      subtext: reportCount > 0 ? `${reportCount} due diligence dossiers` : "No reports generated yet",
      icon: FileText,
      color: "from-indigo-500/20 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/40",
    },
    {
      id: "saved",
      title: "Saved Properties",
      count: String(savedCount),
      subtext: savedCount > 0 ? `${savedCount} watchlisted parcels` : "No saved properties yet",
      icon: Bookmark,
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
    },
    {
      id: "completion",
      title: "Profile Completion",
      count: `${completionPercentage}%`,
      subtext: completionPercentage >= 100 ? "All profile fields complete" : "Additional details pending",
      icon: ShieldCheck,
      color: "from-cyan-500/20 to-blue-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 font-mono text-xs">
      {stats.map((stat, idx) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * idx }}
            className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-[#334155] shadow-md hover:shadow-lg transition-all relative overflow-hidden group bg-white dark:bg-[#1E293B]"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 dark:text-[#94A3B8] tracking-wider">
                {stat.title}
              </span>
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} border shadow-xs`}>
                <IconComponent size={18} />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC] font-mono tracking-tight">
                {stat.count}
              </h3>
              <div className="pt-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8]">
                  {stat.subtext}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default UserStatsGrid;
