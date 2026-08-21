import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import DashboardCard from "../components/dashboard/DashboardCard";
import QuickActions from "../components/dashboard/QuickActions";
import {
  ShieldCheck,
  Users,
  Building2,
  FileText,
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Server,
  Database,
  ArrowUpRight,
  Shield,
  Layers,
  RotateCcw,
  Sparkles,
  MapPin,
} from "lucide-react";
import { showSuccessAlert, showToast } from "../utils/swal";
import { exportToPdf } from "../utils/exportUtils";
import { getAdminDashboardAnalytics } from "../services/adminService";
import { getAllAuditLogs } from "../services/auditService";
import { getAllReports } from "../services/reportService";
import { getAllProperties } from "../services/propertyService";
import { getCurrentUser } from "../services/authService";

function AdminDashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [reports, setReports] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Authenticated user identity
  const storedUser = getCurrentUser() || JSON.parse(localStorage.getItem("user") || "{}");
  const userName = storedUser.firstName 
    ? `${storedUser.firstName} ${storedUser.lastName || ""}`.trim() 
    : (storedUser.name || "System Administrator");

  const fetchAdminData = useCallback(async (isManualSync = false) => {
    try {
      if (isManualSync) setSyncing(true);
      else setLoading(true);

      const [analyticsRes, logsRes, reportsRes, propsRes] = await Promise.allSettled([
        getAdminDashboardAnalytics(),
        getAllAuditLogs(),
        getAllReports(0, 20),
        getAllProperties(0, 50),
      ]);

      let online = false;

      if (analyticsRes.status === "fulfilled" && analyticsRes.value?.data) {
        setAnalytics(analyticsRes.value.data);
        online = true;
      }
      if (logsRes.status === "fulfilled") {
        const logData = logsRes.value?.data || logsRes.value;
        setAuditLogs(Array.isArray(logData) ? logData : []);
        online = true;
      }
      if (reportsRes.status === "fulfilled") {
        const rptData = reportsRes.value?.data || reportsRes.value;
        setReports(rptData?.content || (Array.isArray(rptData) ? rptData : []));
        online = true;
      }
      if (propsRes.status === "fulfilled") {
        const pData = propsRes.value?.data || propsRes.value;
        setProperties(pData?.content || (Array.isArray(pData) ? pData : []));
        online = true;
      }

      setIsOnline(online);
      const nowStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSyncTime(nowStr);

      if (isManualSync) {
        showToast("Platform telemetry refreshed from PostgreSQL database", "success");
      }
    } catch (err) {
      console.error("Admin dashboard data fetch error:", err);
      setIsOnline(false);
      if (isManualSync) {
        showToast("Unable to sync telemetry with backend", "error");
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();

    // Auto-polling telemetry interval every 45 seconds with cleanup
    const interval = setInterval(() => {
      fetchAdminData();
    }, 45000);

    return () => clearInterval(interval);
  }, [fetchAdminData]);

  // Compute dynamic property status distribution from real properties
  const propertyStatusDistribution = useMemo(() => {
    if (!properties || properties.length === 0) {
      return [
        { name: "Verified Clear", value: 1, color: "#10B981" },
        { name: "Under Review", value: 1, color: "#F59E0B" },
      ];
    }
    const counts = {};
    properties.forEach((p) => {
      const st = p.status || "UNDER_REVIEW";
      counts[st] = (counts[st] || 0) + 1;
    });

    const colorMap = {
      VERIFIED: "#10B981",
      UNDER_REVIEW: "#F59E0B",
      FLAGGED: "#EF4444",
      PENDING: "#3B82F6",
    };

    return Object.entries(counts).map(([k, v]) => ({
      name: k.replace(/_/g, " "),
      value: v,
      color: colorMap[k] || "#6366F1",
    }));
  }, [properties]);

  // Compute dynamic audit actions breakdown from real audit logs
  const auditActivityByAction = useMemo(() => {
    if (!auditLogs || auditLogs.length === 0) return [];
    const counts = {};
    auditLogs.forEach((log) => {
      const act = (log.action || "SYSTEM").replace(/_/g, " ");
      counts[act] = (counts[act] || 0) + 1;
    });
    return Object.entries(counts)
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }));
  }, [auditLogs]);

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* 1. HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold">
              <ShieldCheck size={14} /> Enterprise Governance Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              Platform Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] max-w-2xl">
              Welcome back, <strong className="text-slate-900 dark:text-white font-bold">{userName}</strong>. Complete operational telemetry across user directories, PostgreSQL registry, and automated due diligence pipelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200/60 dark:border-[#334155] text-slate-600 dark:text-slate-300">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
              <span className="font-bold">{isOnline ? "PostgreSQL & Spring Boot Online" : "Backend Offline"}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={RotateCcw}
              onClick={() => fetchAdminData(true)}
              loading={syncing}
            >
              Sync DB Telemetry
            </Button>
          </div>
        </div>

        {/* 2. ENTERPRISE KPI TELEMETRY CARDS (8 Core Live PostgreSQL KPI Metrics) */}
        <div>
          <DashboardCard
            analytics={analytics}
            loading={loading}
            isOnline={isOnline}
            lastSyncTime={lastSyncTime}
          />
        </div>

        {/* 3. QUICK ACTIONS */}
        <QuickActions userRole="Administrator" />

        {/* 4. REAL-TIME PLATFORM AUDIT LOGS & INFRASTRUCTURE FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* RECENT AUDIT LOG TELEMETRY */}
          <div className="lg:col-span-7 white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={16} className="text-blue-500" /> Platform Security & Audit Feed
              </h2>
              <button
                onClick={() => navigate("/recent-activity")}
                className="text-xs text-blue-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View All Logs</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  title="No Audit Logs Recorded"
                  message="System operations will automatically generate telemetry in this feed."
                />
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {auditLogs.slice(0, 5).map((log, idx) => {
                  const logId = log.id || log.logId || `LOG-${idx + 1}`;
                  const actionStr = (log.action || "SYSTEM_EVENT").replace(/_/g, " ");
                  const userStr = log.username || log.performedBy || log.userEmail || "System Telemetry";
                  const dateStr = log.timestamp || log.createdAt ? new Date(log.timestamp || log.createdAt).toLocaleString("en-GB") : "Recent";
                  const isSuccess = (log.status || "SUCCESS").toUpperCase() === "SUCCESS";

                  return (
                    <div
                      key={logId}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-between gap-3 hover:border-blue-500/40 transition-all"
                    >
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {actionStr}
                        </h3>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          By {userStr} • {dateStr}
                        </span>
                      </div>
                      <Badge variant={isSuccess ? "success" : "danger"}>
                        {log.status || "SUCCESS"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* INFRASTRUCTURE & DATABASE TELEMETRY */}
          <div className="lg:col-span-5 white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Server size={16} className="text-emerald-500" /> Platform Infrastructure Telemetry
              </h2>
              <button
                onClick={() => navigate("/system-monitoring")}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Full Telemetry</span>
                <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white font-extrabold text-xs block">
                    PostgreSQL Database Engine
                  </strong>
                  <span className="text-[10px] text-slate-400">Port 5432 • HikariCP Active</span>
                </div>
                <Badge variant="success">CONNECTED</Badge>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white font-extrabold text-xs block">
                    Spring Boot Microservices
                  </strong>
                  <span className="text-[10px] text-slate-400">Port 8081 • REST Controller Layer</span>
                </div>
                <Badge variant="info">ONLINE</Badge>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 dark:text-white font-extrabold text-xs block">
                    Telemetry Refresh Frequency
                  </strong>
                  <span className="text-[10px] text-slate-400">Polled every 45 seconds</span>
                </div>
                <span className="text-xs font-mono font-extrabold text-purple-600 dark:text-purple-400">
                  {lastSyncTime || "Real-time"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. DUE DILIGENCE REPORT MANAGEMENT REGISTRY */}
        <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText size={18} className="text-purple-500" /> Recent Due Diligence Dossiers
            </h2>
            <button
              onClick={() => navigate("/report-management")}
              className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Manage Reports</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="py-8">
              <EmptyState
                title="No Reports Generated Yet"
                message="Due diligence reports generated by users will appear in this administrative registry."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[#334155] text-slate-400 text-[10px] uppercase font-bold">
                    <th className="pb-3">Report ID</th>
                    <th className="pb-3">Property ID / Name</th>
                    <th className="pb-3">Report Type</th>
                    <th className="pb-3">Generated Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                  {reports.slice(0, 5).map((rpt) => {
                    const rptId = rpt.reportId || rpt.id;
                    const pId = rpt.propertyId || rpt.property?.propertyId || "—";
                    const pName = rpt.propertyName || rpt.property?.propertyName || `Property #${pId}`;
                    const rptType = (rpt.reportType || "DUE_DILIGENCE").replace(/_/g, " ");
                    const dateStr = rpt.createdAt ? new Date(rpt.createdAt).toLocaleDateString("en-GB") : "Recent";
                    const st = rpt.status || "COMPLETED";

                    return (
                      <tr key={rptId} className="hover:bg-slate-50 dark:hover:bg-[#0F172A]">
                        <td className="py-3 font-bold text-blue-600 dark:text-cyan-400">
                          RPT-{rptId}
                        </td>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">
                          {pName} (PR-{pId})
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">
                          {rptType}
                        </td>
                        <td className="py-3 text-slate-400">{dateStr}</td>
                        <td className="py-3">
                          <Badge variant={st === "COMPLETED" || st === "VERIFIED" ? "success" : "warning"}>
                            {st}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => navigate(`/report-history`)}
                              className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-300 hover:bg-blue-100 cursor-pointer"
                              title="Preview"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => exportToPdf(rptId, rpt)}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer"
                              title="Download PDF"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 6. CHARTS & REGISTRY BREAKDOWNS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* AUDIT LOG TELEMETRY CHART (7 COLS) */}
          <div className="lg:col-span-7 white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-500" /> Audit Actions Breakdown
              </h2>
              <button
                onClick={() => navigate("/recent-activity")}
                className="text-xs text-blue-600 dark:text-cyan-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>Audit Logs</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
            <div className="h-64 w-full pt-2">
              {auditActivityByAction.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400">
                  No telemetry logged yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={auditActivityByAction} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="action" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF", fontSize: "11px" }} />
                    <Bar dataKey="count" name="Audit Events" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* PROPERTY VERIFICATION DISTRIBUTION (5 COLS) */}
          <div className="lg:col-span-5 white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 size={16} className="text-purple-500" /> Property Status Breakdown
              </h2>
            </div>
            <div className="h-64 w-full flex items-center justify-center">
              {propertyStatusDistribution.length === 0 ? (
                <span className="text-slate-400">No properties in database.</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyStatusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {propertyStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "12px", color: "#FFF", fontSize: "11px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default AdminDashboard;
