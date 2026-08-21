import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FileDown,
  ArrowRightLeft,
  Eye,
  Clock,
  Activity,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  Sparkles,
  Building2,
  FileText,
  ShieldAlert,
} from "lucide-react";
import Badge from "../common/Badge";
import { Skeleton } from "../common/Skeleton";
import { getAllAuditLogs } from "../../services/auditService";
import { getMyReports } from "../../services/reportService";
import { getAllProperties } from "../../services/propertyService";

const ACTIVITY_FILTERS = [
  { id: "ALL", label: "All Activities" },
  { id: "REPORT", label: "Report Generated", icon: FileDown },
  { id: "PROPERTY", label: "Property Audited", icon: Building2 },
  { id: "SECURITY", label: "System & Auth", icon: Activity },
];

function RecentActivityFeed({ isFullPage = false }) {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState("ALL");
  const [activityItems, setActivityItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const [auditRes, reportRes, propRes] = await Promise.allSettled([
          getAllAuditLogs(0, 30),
          getMyReports(),
          getAllProperties(0, 20),
        ]);

        const items = [];

        // 1. Audit Logs
        if (auditRes.status === "fulfilled") {
          const logs = auditRes.value?.content || (Array.isArray(auditRes.value) ? auditRes.value : auditRes.value?.data?.content || []);
          logs.forEach((log) => {
            const timeStr = log.createdAt ? new Date(log.createdAt).toLocaleString() : "Recently";
            items.push({
              id: `audit-${log.logId || log.id || Math.random()}`,
              type: "SECURITY",
              title: log.action || "System Event",
              description: log.details || `${log.action} executed by ${log.userEmail || "user"}.`,
              target: log.userEmail ? `User: ${log.userEmail}` : `Status: ${log.status || "SUCCESS"}`,
              timestamp: timeStr,
              timestampRaw: log.createdAt ? new Date(log.createdAt) : new Date(0),
              status: log.status || "EXECUTED",
              variant: log.status === "FAILED" ? "danger" : "info",
              icon: Activity,
              iconBg: "bg-blue-600 text-white",
              borderColor: "border-blue-500",
              linkPath: "/admin/audit-logs",
            });
          });
        }

        // 2. Reports
        if (reportRes.status === "fulfilled") {
          const reports = Array.isArray(reportRes.value?.data) ? reportRes.value.data : (Array.isArray(reportRes.value) ? reportRes.value : []);
          reports.forEach((rpt) => {
            const timeStr = rpt.createdAt ? new Date(rpt.createdAt).toLocaleString() : "Recently";
            items.push({
              id: `report-${rpt.reportId}`,
              type: "REPORT",
              title: "Due Diligence Report",
              description: rpt.reportName || `Generated executive due diligence audit for ${rpt.propertyName || "property"}.`,
              target: `PR-${rpt.propertyId} • ${rpt.propertyName || "Property Parcel"}`,
              timestamp: timeStr,
              timestampRaw: rpt.createdAt ? new Date(rpt.createdAt) : new Date(0),
              status: rpt.reportStatus || "GENERATED",
              variant: "success",
              icon: FileDown,
              iconBg: "bg-emerald-600 text-white",
              borderColor: "border-emerald-500",
              linkPath: `/due-diligence-report?id=${rpt.propertyId}`,
            });
          });
        }

        // 3. Properties
        if (propRes.status === "fulfilled") {
          const props = propRes.value?.content || (Array.isArray(propRes.value) ? propRes.value : propRes.value?.data?.content || []);
          props.slice(0, 10).forEach((p) => {
            const pId = p.propertyId || p.id;
            const pName = p.propertyName || `Property Parcel #${pId}`;
            const timeStr = p.createdAt ? new Date(p.createdAt).toLocaleString() : "Active Record";
            items.push({
              id: `prop-${pId}`,
              type: "PROPERTY",
              title: "Property Registry Entry",
              description: `Parcel ${pName} recorded with status ${p.status || "ACTIVE"}.`,
              target: `PR-${pId} • ${p.city || "Urban"}, ${p.state || "India"}`,
              timestamp: timeStr,
              timestampRaw: p.createdAt ? new Date(p.createdAt) : new Date(0),
              status: p.status === "VERIFIED" ? "Verified Deed" : (p.status || "Registered"),
              variant: p.status === "VERIFIED" ? "success" : "warning",
              icon: Building2,
              iconBg: "bg-purple-600 text-white",
              borderColor: "border-purple-500",
              linkPath: `/property-review?id=${pId}`,
            });
          });
        }

        // Sort newest first
        items.sort((a, b) => b.timestampRaw - a.timestampRaw);
        setActivityItems(items);
      } catch (err) {
        console.warn("Failed to load activity stream:", err);
        setActivityItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const filteredItems = useMemo(() => {
    if (filterType === "ALL") return activityItems;
    return activityItems.filter((item) => item.type === filterType);
  }, [filterType, activityItems]);

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs space-y-6">
      {/* Activity Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#334155]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold mb-2">
            <Activity size={14} /> Audit Trail & System Telemetry Log
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            ⚡ Recent Activity Stream
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1">
            Real-time chronological telemetry tracking property registrations, PDF report downloads, and security audit logs from PostgreSQL.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          POSTGRESQL AUDIT STREAM
        </span>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {ACTIVITY_FILTERS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              filterType === tab.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md scale-102"
                : "bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.icon && <tab.icon size={13} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activities Timeline Feed */}
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
          <Activity size={32} className="mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Recent Activity Found</p>
          <p className="text-xs text-slate-500 mt-1">Audit log telemetry and user activity will stream here in real-time.</p>
        </div>
      ) : (
        <div className="space-y-3 font-mono">
          {filteredItems.slice(0, isFullPage ? 50 : 6).map((item) => {
            const Icon = item.icon || Activity;
            return (
              <div
                key={item.id}
                onClick={() => item.linkPath && navigate(item.linkPath)}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#0F172A]/70 border border-slate-200/80 dark:border-[#334155] hover:border-blue-500 dark:hover:border-cyan-500 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-xs group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                        {item.title}
                      </h4>
                      <Badge variant={item.variant}>{item.status}</Badge>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{item.description}</p>
                    <p className="text-slate-400 text-[10px] mt-0.5 font-bold">{item.target}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-bold">
                    <Clock size={11} /> {item.timestamp}
                  </span>
                  <ArrowUpRight size={14} className="text-slate-400 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RecentActivityFeed;
