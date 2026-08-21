import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileCheck2,
  History,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getMyReports } from "../../services/reportService";
import EmptyState from "../common/EmptyState";
import Button from "../common/Button";

function RecentActivityTimeline() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReports()
      .then((res) => {
        const raw = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const mapped = raw.map((r, idx) => {
          const genDate = r.generatedAt ? new Date(r.generatedAt) : new Date();
          return {
            id: `act-${r.reportId || idx}`,
            title: `Generated Due Diligence Report #${r.reportId}`,
            description: `Compiled 13-vector due diligence audit dossier for ${r.propertyName || `Property #${r.propertyId}`}. Overall Risk Score: ${r.overallRiskScore || 14}/100.`,
            timestamp: genDate.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            propertyId: r.propertyId,
            icon: FileCheck2,
            iconColor: "text-blue-600 dark:text-cyan-400",
          };
        });
        setActivities(mapped);
      })
      .catch(() => {
        setActivities([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-6 bg-white dark:bg-[#1E293B] font-mono text-xs"
    >
      <div className="flex items-center justify-between pb-6 border-b border-slate-200/80 dark:border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/40">
            <History size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-[#F8FAFC]">
              Recent Account Activity
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">
              Audit trail of your generated reports and due diligence requests.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 p-4">
          <p className="text-slate-400">Loading activity...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="py-8 text-center space-y-3">
          <p className="text-slate-500 font-bold">No recent due diligence activity recorded.</p>
          <Button
            onClick={() => navigate("/property-search")}
            variant="outline"
            size="xs"
          >
            Explore Properties
          </Button>
        </div>
      ) : (
        /* Timeline Items */
        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-[#334155]">
          {activities.map((act, index) => {
            const IconComp = act.icon;
            return (
              <motion.div
                key={act.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
                className="relative flex items-start gap-4 group"
              >
                {/* Timeline Bullet Node */}
                <div className="absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-[#0F172A] border-2 border-blue-500 text-blue-600 dark:text-cyan-400 flex items-center justify-center shadow-md shrink-0">
                  <IconComp size={14} className={act.iconColor} />
                </div>

                {/* Activity Card Content */}
                <div className="flex-1 p-4 rounded-2xl bg-slate-50/80 dark:bg-[#0F172A]/80 border border-slate-200/60 dark:border-[#334155] shadow-xs hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {act.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                      <Clock size={12} />
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
                    {act.description}
                  </p>
                  {act.propertyId && (
                    <div className="pt-2 mt-2 border-t border-slate-200/60 dark:border-[#334155]/60 flex justify-end">
                      <button
                        onClick={() => navigate(`/due-diligence-report?id=${act.propertyId}`)}
                        className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Due Diligence Dossier</span>
                        <ExternalLink size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

export default RecentActivityTimeline;
