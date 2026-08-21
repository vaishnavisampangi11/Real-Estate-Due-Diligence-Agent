import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  Activity,
  Search,
  Filter,
  Users,
  Calendar,
  Clock,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Terminal,
  Layers,
  RefreshCw,
  FileSpreadsheet,
  AlertCircle,
  Home,
  Database,
} from "lucide-react";
import { showSuccessAlert, showToast } from "../utils/swal";
import { getAllAuditLogs } from "../services/auditService";

function RecentActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Filters State
  const [selectedUserFilter, setSelectedUserFilter] = useState("ALL");
  const [selectedActionFilter, setSelectedActionFilter] = useState("ALL");
  const [selectedEntityFilter, setSelectedEntityFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("DATE_DESC");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch real audit logs from PostgreSQL via GET /api/audit-logs
  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getAllAuditLogs();
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      const formatted = rawList.map((item) => {
        const d = item.createdAt ? new Date(item.createdAt) : new Date();
        const userDisplay = item.userEmail || (item.userId ? `User #${item.userId}` : "Unknown User");
        const actionDisplay = item.action || "SYSTEM_EVENT";
        const entityDisplay = item.entityName
          ? `${item.entityName}${item.entityId ? ` #${item.entityId}` : ""}`
          : "System Core";

        return {
          id: `LOG-${item.auditLogId}`,
          rawId: item.auditLogId,
          user: userDisplay,
          userEmail: item.userEmail || "Unknown",
          action: actionDisplay,
          entityName: item.entityName || "Core",
          entityTarget: entityDisplay,
          module: item.entityName || "System",
          date: d.toLocaleDateString(),
          time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          timestamp: d,
          ipAddress: item.ipAddress || "Not recorded",
          status: "Success",
          variant: "success",
        };
      });

      setLogs(formatted);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Unable to load audit logs. Please check the backend connection and try again.";
      setError(msg);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Derive Dynamic Filter Options from live data
  const filterOptions = useMemo(() => {
    const users = Array.from(new Set(logs.map((l) => l.user).filter(Boolean))).sort();
    const actions = Array.from(new Set(logs.map((l) => l.action).filter(Boolean))).sort();
    const entities = Array.from(new Set(logs.map((l) => l.entityName).filter(Boolean))).sort();

    return { users, actions, entities };
  }, [logs]);

  // Filter Logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.id.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entityTarget.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q);

      const matchesUser = selectedUserFilter === "ALL" || log.user === selectedUserFilter;
      const matchesAction = selectedActionFilter === "ALL" || log.action === selectedActionFilter;
      const matchesEntity = selectedEntityFilter === "ALL" || log.entityName === selectedEntityFilter;

      return matchesSearch && matchesUser && matchesAction && matchesEntity;
    });
  }, [logs, searchQuery, selectedUserFilter, selectedActionFilter, selectedEntityFilter]);

  // Sort Logic
  const sortedLogs = useMemo(() => {
    const list = [...filteredLogs];
    if (sortBy === "DATE_DESC") {
      list.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === "DATE_ASC") {
      list.sort((a, b) => a.timestamp - b.timestamp);
    } else if (sortBy === "ACTION_ASC") {
      list.sort((a, b) => a.action.localeCompare(b.action));
    } else if (sortBy === "USER_ASC") {
      list.sort((a, b) => a.user.localeCompare(b.user));
    }
    return list;
  }, [filteredLogs, sortBy]);

  // Pagination Calculation
  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / itemsPerPage));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedLogs.slice(start, start + itemsPerPage);
  }, [sortedLogs, currentPage, itemsPerPage]);

  // Live Export Functionality
  const handleExportLogs = () => {
    if (sortedLogs.length === 0) {
      showToast("No audit logs available to export.", "info");
      return;
    }

    const headers = ["Log ID", "User", "Action", "Target Entity", "Date", "Time", "IP Address", "Status"];
    const rows = sortedLogs.map((l) => [
      l.id,
      `"${l.user.replace(/"/g, '""')}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.entityTarget.replace(/"/g, '""')}"`,
      l.date,
      l.time,
      l.ipAddress,
      l.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platform_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccessAlert("Audit Export Generated", `Exported ${sortedLogs.length} audit logs to CSV successfully.`);
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-blue-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Platform Audit & Activity Trail
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-800">
              AUDIT STREAM • POSTGRESQL LIVE
            </span>
          </div>
        </div>

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold">
              <ShieldCheck size={14} /> Immutable System Audit Ledger
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              System Audit & Activity Trail
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] max-w-2xl">
              Real-time administrative ledger capturing authentication events, role changes, valuation reports, and database transactions across the platform.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 z-10 shrink-0">
            <Button
              onClick={handleExportLogs}
              variant="secondary"
              size="sm"
              icon={Download}
            >
              Export CSV
            </Button>
            <Button
              onClick={fetchAuditLogs}
              variant="outline"
              size="sm"
              icon={RefreshCw}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <p className="text-xs font-semibold">{error}</p>
          </div>
        )}

        {/* FILTER & SEARCH CONTROL STRIP */}
        <div className="white-card rounded-2xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search logs by ID, user, action, target entity, or IP..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* User Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <Users size={12} className="text-slate-400" />
              <select
                value={selectedUserFilter}
                onChange={(e) => {
                  setSelectedUserFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Users ({logs.length})</option>
                {filterOptions.users.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <Terminal size={12} className="text-slate-400" />
              <select
                value={selectedActionFilter}
                onChange={(e) => {
                  setSelectedActionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Actions</option>
                {filterOptions.actions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Entity / Module Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <Layers size={12} className="text-slate-400" />
              <select
                value={selectedEntityFilter}
                onChange={(e) => {
                  setSelectedEntityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Modules</option>
                {filterOptions.entities.map((en) => (
                  <option key={en} value={en}>
                    {en}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && logs.length === 0 && (
          <div className="py-12">
            <EmptyState
              title="No audit records found."
              message="No audit events have been recorded in the database yet."
            />
          </div>
        )}

        {/* SEARCH EMPTY STATE */}
        {!loading && !error && logs.length > 0 && sortedLogs.length === 0 && (
          <div className="py-8">
            <EmptyState
              title="No matching audit logs"
              message={`No records matched "${searchQuery}".`}
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery("");
                setSelectedUserFilter("ALL");
                setSelectedActionFilter("ALL");
                setSelectedEntityFilter("ALL");
              }}
            />
          </div>
        )}

        {/* AUDIT LOGS TABLE */}
        {!loading && !error && sortedLogs.length > 0 && (
          <div className="white-card rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-[#334155] bg-slate-50/50 dark:bg-[#0F172A]/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Log ID</th>
                    <th className="py-3.5 px-5">User</th>
                    <th className="py-3.5 px-5">Action</th>
                    <th className="py-3.5 px-5">Target Entity</th>
                    <th className="py-3.5 px-5">Date & Time</th>
                    <th className="py-3.5 px-5">IP Address</th>
                    <th className="py-3.5 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                  {paginatedLogs.map((log) => {
                    const isSuccess = log.status === "Success" || log.status === "SUCCESS";

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-[#0F172A]/40 transition-colors"
                      >
                        <td className="py-4 px-5 font-bold text-blue-600 dark:text-cyan-400 whitespace-nowrap">
                          {log.id}
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-900 dark:text-white">
                          <div>{log.user}</div>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {log.userEmail}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-medium text-slate-700 dark:text-slate-200">
                          {log.action}
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-800 dark:text-slate-300">
                          {log.entityTarget}
                        </td>
                        <td className="py-4 px-5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          <div>{log.date}</div>
                          <span className="text-[10px] text-slate-400">{log.time}</span>
                        </td>
                        <td className="py-4 px-5 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {log.ipAddress}
                        </td>
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          <Badge variant={isSuccess ? "success" : "danger"}>
                            {log.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION STRIP */}
            <div className="p-4 border-t border-slate-100 dark:border-[#334155] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing <strong className="text-slate-900 dark:text-white font-bold">{Math.min((currentPage - 1) * itemsPerPage + 1, sortedLogs.length)}</strong> to <strong className="text-slate-900 dark:text-white font-bold">{Math.min(currentPage * itemsPerPage, sortedLogs.length)}</strong> of <strong className="text-slate-900 dark:text-white font-bold">{sortedLogs.length}</strong> entries
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#0F172A] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default RecentActivity;
