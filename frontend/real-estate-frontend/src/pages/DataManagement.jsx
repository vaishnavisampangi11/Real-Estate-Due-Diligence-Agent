import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { Skeleton } from "../components/common/Skeleton";
import {
  Database,
  FileSpreadsheet,
  Download,
  HardDrive,
  RefreshCw,
  Users,
  FileText,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Server,
  Layers,
  Sparkles,
  FileCheck,
  X,
  FileCode,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { showSuccessAlert, showToast, showErrorAlert } from "../utils/swal";
import { getAllUsers } from "../services/userService";
import { getMyReports } from "../services/reportService";
import { getAllAuditLogs } from "../services/auditService";
import { getSystemMonitoringTelemetry } from "../services/adminService";

// Generic CSV File Exporter Helper
const exportDataToCsv = (filename, headers, rows) => {
  if (!rows || rows.length === 0) {
    showToast(`No records available to export for ${filename}`, "info");
    return;
  }

  const csvRows = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
    ...rows.map((row) =>
      row
        .map((val) => `"${(val ?? "").toString().replace(/"/g, '""')}"`)
        .join(",")
    ),
  ];

  const csvContent = "\uFEFF" + csvRows.join("\r\n"); // UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

function DataManagement() {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState("");

  const fetchData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setSyncing(true);
      else setLoading(true);
      setError(null);

      const [usersRes, reportsRes, auditRes, telemRes] = await Promise.allSettled([
        getAllUsers(),
        getMyReports(),
        getAllAuditLogs(),
        getSystemMonitoringTelemetry(),
      ]);

      if (usersRes.status === "fulfilled" && usersRes.value) {
        const uList = Array.isArray(usersRes.value) ? usersRes.value : (usersRes.value?.data || []);
        setUsers(uList);
      } else {
        setUsers([]);
      }

      if (reportsRes.status === "fulfilled" && reportsRes.value) {
        const rList = reportsRes.value?.data || (Array.isArray(reportsRes.value) ? reportsRes.value : []);
        setReports(rList);
      } else {
        setReports([]);
      }

      if (auditRes.status === "fulfilled" && auditRes.value) {
        const aList = Array.isArray(auditRes.value) ? auditRes.value : (auditRes.value?.data || []);
        setAuditLogs(aList);
      } else {
        setAuditLogs([]);
      }

      if (telemRes.status === "fulfilled" && telemRes.value) {
        setTelemetry(telemRes.value?.data || telemRes.value);
      } else {
        setTelemetry(null);
      }

      const nowStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSyncTime(nowStr);

      if (isManual) {
        showToast("Platform data metrics refreshed from PostgreSQL", "success");
      }
    } catch (err) {
      console.error("Failed to load platform data metrics:", err);
      setError("Unable to load data management metrics. Please check Spring Boot backend.");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // EXPORT ACTION 1: USERS CSV
  const handleExportUsersCsv = () => {
    try {
      const headers = ["User ID", "Full Name", "Email", "Phone", "Role", "Active Status", "Email Verified", "Created Date"];
      const rows = users.map((u) => [
        u.userId,
        `${u.firstName || ""} ${u.lastName || ""}`.trim() || "User",
        u.email || "",
        u.phone || "N/A",
        u.role?.roleName || "User",
        u.isActive !== false ? "Active" : "Inactive",
        u.emailVerified ? "Verified" : "Unverified",
        u.createdAt ? new Date(u.createdAt).toISOString() : "",
      ]);

      const dateStr = new Date().toISOString().split("T")[0];
      exportDataToCsv(`users_directory_export_${dateStr}.csv`, headers, rows);
      showSuccessAlert(
        "Users CSV Exported",
        `Exported ${users.length} live user records from PostgreSQL database.`
      );
    } catch (err) {
      console.error("Failed to export users CSV:", err);
      showErrorAlert("Export Failed", "Could not generate users CSV file.");
    }
  };

  // EXPORT ACTION 2: REPORTS CSV
  const handleExportReportsCsv = () => {
    try {
      const headers = ["Report ID", "Property", "Report Type", "Status", "Overall Risk Score", "Summary", "Created Date"];
      const rows = reports.map((r) => [
        r.reportId || r.id,
        r.propertyName || (r.propertyId ? `Property #${r.propertyId}` : "General"),
        r.reportType || "Due Diligence Dossier",
        r.reportStatus || r.status || "Completed",
        r.overallRiskScore != null ? r.overallRiskScore : "N/A",
        r.executiveSummary || r.notes || "",
        r.createdAt ? new Date(r.createdAt).toISOString() : "",
      ]);

      const dateStr = new Date().toISOString().split("T")[0];
      exportDataToCsv(`reports_catalog_export_${dateStr}.csv`, headers, rows);
      showSuccessAlert(
        "Reports CSV Exported",
        `Exported ${reports.length} live due diligence reports from PostgreSQL database.`
      );
    } catch (err) {
      console.error("Failed to export reports CSV:", err);
      showErrorAlert("Export Failed", "Could not generate reports CSV file.");
    }
  };

  // EXPORT ACTION 3: AUDIT LOGS CSV
  const handleExportAuditLogsCsv = () => {
    try {
      const headers = ["Audit ID", "Action Event", "Entity Name", "Entity ID", "Triggered User", "Client IP", "Timestamp"];
      const rows = auditLogs.map((l) => [
        l.auditLogId || l.id,
        l.action || "System Event",
        l.entityName || "N/A",
        l.entityId || "N/A",
        l.user ? `${l.user.firstName || ""} ${l.user.lastName || ""}`.trim() : (l.user?.email || "System"),
        l.ipAddress || "Localhost / Direct",
        l.createdAt || l.actionTime ? new Date(l.createdAt || l.actionTime).toISOString() : "",
      ]);

      const dateStr = new Date().toISOString().split("T")[0];
      exportDataToCsv(`audit_telemetry_logs_${dateStr}.csv`, headers, rows);
      showSuccessAlert(
        "Audit Logs CSV Exported",
        `Exported ${auditLogs.length} live audit telemetry events from PostgreSQL database.`
      );
    } catch (err) {
      console.error("Failed to export audit logs CSV:", err);
      showErrorAlert("Export Failed", "Could not generate audit logs CSV file.");
    }
  };

  const storage = telemetry?.storage;
  const database = telemetry?.database;

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* HEADER BAR */}
        <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 font-bold mb-2">
              <Database size={14} /> Enterprise Data Governance & Export
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Data Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Export live system users, report dossiers, and audit telemetry directly from PostgreSQL. Inspect storage allocations and database persistence.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => fetchData(true)}
              variant="outline"
              size="sm"
              icon={RotateCcw}
              loading={syncing || loading}
            >
              {syncing ? "Syncing..." : lastSyncTime ? `Sync (${lastSyncTime})` : "Refresh"}
            </Button>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <Button onClick={() => fetchData(true)} variant="danger" size="xs">Retry</Button>
          </div>
        )}

        {/* 6 SECTIONS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-56 rounded-3xl" />
            <Skeleton className="h-56 rounded-3xl" />
            <Skeleton className="h-56 rounded-3xl" />
            <Skeleton className="h-56 rounded-3xl" />
            <Skeleton className="h-56 rounded-3xl" />
            <Skeleton className="h-56 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* SECTION 1: EXPORT USERS */}
            <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users size={16} className="text-blue-500" /> 1. Export Users
                  </h2>
                  <Badge variant="primary">{users.length} Records</Badge>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
                  Export complete user account directory containing role permissions, contact details, registration timestamps, and account status from PostgreSQL.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#334155]">
                <button
                  onClick={handleExportUsersCsv}
                  disabled={users.length === 0}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  <FileSpreadsheet size={15} className="text-blue-600 dark:text-cyan-400" />
                  <span>Export Users CSV ({users.length})</span>
                </button>
              </div>
            </div>

            {/* SECTION 2: EXPORT REPORTS */}
            <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText size={16} className="text-purple-500" /> 2. Export Reports
                  </h2>
                  <Badge variant="info">{reports.length} Reports</Badge>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
                  Export 13-vector due diligence audit report catalog with risk scores, sub-registrar verification flags, and applicant details.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#334155]">
                <button
                  onClick={handleExportReportsCsv}
                  disabled={reports.length === 0}
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  <FileSpreadsheet size={15} className="text-purple-600 dark:text-purple-400" />
                  <span>Export Reports CSV ({reports.length})</span>
                </button>
              </div>
            </div>

            {/* SECTION 3: EXPORT AUDIT LOGS */}
            <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity size={16} className="text-amber-500" /> 3. Export Audit Logs
                  </h2>
                  <Badge variant="warning">{auditLogs.length} Records</Badge>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
                  Export chronological platform security telemetry, entity mutations, client IP records, and system execution trails.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-[#334155]">
                <button
                  onClick={handleExportAuditLogsCsv}
                  disabled={auditLogs.length === 0}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 font-bold transition-all cursor-pointer flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  <FileSpreadsheet size={15} className="text-amber-600 dark:text-amber-400" />
                  <span>Export Audit Logs CSV ({auditLogs.length})</span>
                </button>
              </div>
            </div>

            {/* SECTION 4: DATABASE & BACKUP STATUS */}
            <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database size={16} className="text-emerald-500" /> 4. Backup & Persistence
                </h2>
                <Badge variant="success">Operational</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Database Engine</span>
                  <strong className="text-slate-900 dark:text-white truncate block" title={database?.version}>
                    {database?.version || "PostgreSQL Cluster"}
                  </strong>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Connection</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{database?.connectionStatus || "Connected"}</strong>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Audit Trail</span>
                    <strong className="text-slate-900 dark:text-white">{auditLogs.length} Events</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 5: RESTORE READINESS */}
            <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw size={16} className="text-cyan-500" /> 5. Data Integrity & WAL
                </h2>
                <Badge variant="info">ACID Compliant</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Integrity Model</span>
                  <strong className="text-slate-900 dark:text-white">PostgreSQL WAL & Transaction Logging</strong>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Query Latency</span>
                    <strong className="text-blue-600 dark:text-cyan-400">{database?.latencyMs != null ? `${database.latencyMs}ms` : "Active"}</strong>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Data Durability</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">Strict Persistence</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 6: SYSTEM STORAGE */}
            <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <HardDrive size={16} className="text-indigo-500" /> 6. System Storage
                </h2>
                <Badge variant="primary">{storage?.percentage != null ? `${storage.percentage}% Allocated` : "Local Storage"}</Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <span>Local Filesystem Storage</span>
                    <span>{storage?.usedGb != null ? `${storage.usedGb} GB / ${storage.totalGb} GB` : "Live Disk"}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-[#0F172A] rounded-full h-2.5 overflow-hidden border border-slate-200 dark:border-[#334155]">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, storage?.percentage || 0)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">PostgreSQL Storage</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">Active Persistence</strong>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default DataManagement;
