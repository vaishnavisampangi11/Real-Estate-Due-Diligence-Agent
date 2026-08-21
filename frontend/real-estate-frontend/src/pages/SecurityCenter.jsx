import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Globe,
  Radio,
  UserX,
  Clock,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  X,
  CheckCircle2,
  Terminal,
  Activity,
  Sparkles,
  Server,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { showSuccessAlert, showToast, showConfirmDialog, showErrorAlert } from "../utils/swal";
import { getAllAuditLogs } from "../services/auditService";
import { getAllUsers, toggleUserStatus } from "../services/userService";
import { getCurrentUser } from "../services/authService";

// Helper for relative timestamps
const formatRelativeTime = (rawDate) => {
  if (!rawDate) return "Recently";
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return "Recently";
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

function SecurityCenter() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Modal Control States
  const [viewDetailsModal, setViewDetailsModal] = useState(null);

  const fetchSecurityData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setSyncing(true);
      else setLoading(true);
      setError(null);

      const [logsRes, usersRes, curUser] = await Promise.allSettled([
        getAllAuditLogs(),
        getAllUsers(),
        Promise.resolve(getCurrentUser()),
      ]);

      if (logsRes.status === "fulfilled" && logsRes.value) {
        const rawLogs = Array.isArray(logsRes.value) ? logsRes.value : (logsRes.value?.data || []);
        setAuditLogs(rawLogs);
      } else {
        setAuditLogs([]);
      }

      if (usersRes.status === "fulfilled" && usersRes.value) {
        const rawUsers = Array.isArray(usersRes.value) ? usersRes.value : (usersRes.value?.data || []);
        setUsers(rawUsers);
      } else {
        setUsers([]);
      }

      if (curUser.status === "fulfilled" && curUser.value) {
        setCurrentUser(curUser.value);
      }

      const nowStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSyncTime(nowStr);

      if (isManual) {
        showToast("Security telemetry refreshed from PostgreSQL", "success");
      }
    } catch (err) {
      console.error("Failed to load security center data:", err);
      setError("Unable to load security metrics. Please verify backend is running on port 8081.");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurityData();
  }, [fetchSecurityData]);

  // Derived Real Security Metrics
  const failedLogins = useMemo(() => {
    return auditLogs.filter((l) => {
      const act = (l.action || "").toUpperCase();
      return act.includes("FAIL") || act.includes("AUTH_FAIL") || act.includes("LOGIN_FAIL");
    }).map((l) => ({
      id: `FL-${l.auditLogId || l.id}`,
      targetEmail: l.user?.email || (l.details && typeof l.details === "string" && l.details.includes("@") ? l.details : "System User"),
      ip: l.ipAddress || "Localhost / Direct",
      location: l.ipAddress === "127.0.0.1" || l.ipAddress === "0:0:0:0:0:0:0:1" ? "Localhost Workstation" : (l.ipAddress ? "Recorded Client IP" : "IP not recorded"),
      attempts: 1,
      timestamp: formatRelativeTime(l.createdAt || l.actionTime),
      rawTime: l.createdAt || l.actionTime,
      risk: "Security Flag",
    }));
  }, [auditLogs]);

  const lockedAccounts = useMemo(() => {
    return users.filter((u) => u.isActive === false).map((u) => ({
      id: u.userId,
      name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
      email: u.email,
      role: u.role?.roleName || "User",
      reason: "Account deactivated by administrator",
      lastLogin: u.lastLogin ? formatRelativeTime(u.lastLogin) : "Never",
    }));
  }, [users]);

  const activeSessions = useMemo(() => {
    if (!currentUser) return [];
    return [
      {
        id: `JWT-${currentUser.userId || "AUTH"}`,
        user: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.email,
        email: currentUser.email,
        role: currentUser.role || "Administrator",
        device: "Stateless JWT Bearer Session",
        ip: "Direct API Client",
        location: "Authenticated Session",
        startedAt: "Active Now",
      },
    ];
  }, [currentUser]);

  const resetRequests = useMemo(() => {
    return auditLogs.filter((l) => {
      const act = (l.action || "").toUpperCase();
      return act.includes("RESET") || act.includes("FORGOT") || act.includes("PASSWORD_CHANGE");
    }).map((l) => ({
      id: `RST-${l.auditLogId || l.id}`,
      user: l.user ? `${l.user.firstName || ""} ${l.user.lastName || ""}`.trim() : "System User",
      email: l.user?.email || "user@enterprise.in",
      requestedAt: formatRelativeTime(l.createdAt || l.actionTime),
      status: "Audit Event Recorded",
    }));
  }, [auditLogs]);

  const securityEvents = useMemo(() => {
    return auditLogs.slice(0, 8).map((l, idx) => ({
      id: `SEC-${l.auditLogId || 501 + idx}`,
      event: l.action || "System Audit Event",
      user: l.user ? `${l.user.firstName || ""} ${l.user.lastName || ""}`.trim() : "System Administrator",
      email: l.user?.email || "",
      ip: l.ipAddress || "Localhost / Direct",
      timestamp: formatRelativeTime(l.createdAt || l.actionTime),
      status: (l.action || "").toUpperCase().includes("FAIL") ? "Flagged" : "Success",
    }));
  }, [auditLogs]);

  // ACTION: UNLOCK / ACTIVATE ACCOUNT
  const handleUnlockAccount = async (acc) => {
    try {
      await toggleUserStatus(acc.id, true);
      showSuccessAlert(
        "Account Activated",
        `User account for '${acc.name}' (${acc.email}) has been activated in PostgreSQL.`
      );
      fetchSecurityData(false);
    } catch (err) {
      console.error("Failed to unlock account:", err);
      showErrorAlert("Activation Failed", "Could not activate user account in database.");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* HEADER BAR */}
        <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold mb-2">
              <ShieldAlert size={14} /> Global Security Operations Center (SOC)
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Security Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live telemetry aggregated from PostgreSQL across Failed Logins, Locked Accounts, Active User Sessions, and Audit Logs.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => fetchSecurityData(true)}
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
            <Button onClick={() => fetchSecurityData(true)} variant="danger" size="xs">Retry</Button>
          </div>
        )}

        {/* TOP SUMMARY STATS ROW */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
            <Skeleton className="h-24 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Failed Logins</span>
                <strong className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                  {failedLogins.length} Events
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-800">
                <UserX size={20} />
              </div>
            </div>

            <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Locked Accounts</span>
                <strong className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                  {lockedAccounts.length} Accounts
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-800">
                <Lock size={20} />
              </div>
            </div>

            <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">3. Active Session</span>
                <strong className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {currentUser ? "1 Online (JWT)" : "Stateless JWT"}
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                <Radio size={20} />
              </div>
            </div>

            <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">4. Reset Requests</span>
                <strong className="text-xl font-black text-blue-600 dark:text-cyan-400 mt-1 block">
                  {resetRequests.length} Events
                </strong>
              </div>
              <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 border border-blue-200 dark:border-blue-800">
                <Key size={20} />
              </div>
            </div>
          </div>
        )}

        {/* 2-COLUMN MAIN GRID: 1. FAILED LOGINS + 2. LOCKED ACCOUNTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SECTION 1: FAILED LOGIN ATTEMPTS (7 COLS) */}
          <div className="lg:col-span-7 white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <UserX size={16} className="text-rose-500" /> 1. Failed Login Attempts
              </h2>
              <Badge variant={failedLogins.length > 0 ? "danger" : "success"}>
                {failedLogins.length} Flagged
              </Badge>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {failedLogins.length > 0 ? (
                failedLogins.map((fl) => (
                  <div key={fl.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-between gap-3">
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{fl.targetEmail}</span>
                        <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-600 text-[10px] font-bold">Failed Auth</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        IP: {fl.ip} • {fl.timestamp}
                      </span>
                    </div>

                    <button
                      onClick={() => setViewDetailsModal({ title: "Failed Login Forensics", data: fl })}
                      className="p-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 cursor-pointer"
                      title="View Forensics"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 font-mono text-xs space-y-1">
                  <ShieldCheck size={28} className="mx-auto text-emerald-500 mb-2" />
                  <p className="font-bold text-slate-700 dark:text-slate-200">No failed login events recorded</p>
                  <p className="text-[11px] text-slate-400">All authentication requests verified successfully.</p>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: LOCKED ACCOUNTS (5 COLS) */}
          <div className="lg:col-span-5 white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock size={16} className="text-amber-500" /> 2. Locked & Inactive Accounts
              </h2>
              <Badge variant={lockedAccounts.length > 0 ? "warning" : "success"}>
                {lockedAccounts.length} Locked
              </Badge>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {lockedAccounts.length > 0 ? (
                lockedAccounts.map((acc) => (
                  <div key={acc.id} className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-2">
                    <div>
                      <strong className="text-slate-900 dark:text-white font-extrabold text-xs block">{acc.name}</strong>
                      <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold block">{acc.email}</span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">Role: {acc.role}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60 dark:border-amber-800">
                      <button
                        onClick={() => handleUnlockAccount(acc)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                      >
                        <Unlock size={12} />
                        <span>Unlock Account</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 font-mono text-xs space-y-1">
                  <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-2" />
                  <p className="font-bold text-slate-700 dark:text-slate-200">Zero locked user accounts</p>
                  <p className="text-[11px] text-slate-400">All registered PostgreSQL accounts are active.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: ACTIVE JWT SESSION DETAILS */}
        <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio size={18} className="text-emerald-500" /> 3. Current Authenticated Session
            </h2>
            <Badge variant="success">Stateless JWT</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#334155] text-slate-400 text-[10px] uppercase font-bold">
                  <th className="pb-3">Session User</th>
                  <th className="pb-3">Authentication Architecture</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                {activeSessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50 dark:hover:bg-[#0F172A]">
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      <div>{sess.user}</div>
                      <span className="text-[10px] text-blue-500 font-bold">{sess.email}</span>
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">
                      Bearer Token Authentication (Stateless JWT)
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">{sess.role}</td>
                    <td className="py-3 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> {sess.startedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4: RECENT AUDIT LOG TELEMETRY */}
        <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal size={18} className="text-blue-500" /> 4. Security & Audit Log Stream
            </h2>
            <Badge variant="primary">{auditLogs.length} Events Recorded</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[#334155] text-slate-400 text-[10px] uppercase font-bold">
                  <th className="pb-3">Audit ID</th>
                  <th className="pb-3">Action Event</th>
                  <th className="pb-3">Triggered User</th>
                  <th className="pb-3">Client IP</th>
                  <th className="pb-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                {securityEvents.length > 0 ? (
                  securityEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-50 dark:hover:bg-[#0F172A]">
                      <td className="py-3 font-bold text-blue-600 dark:text-cyan-400">{ev.id}</td>
                      <td className="py-3 font-extrabold text-slate-900 dark:text-white">{ev.event}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">
                        {ev.user} {ev.email && <span className="text-slate-400 text-[10px]">({ev.email})</span>}
                      </td>
                      <td className="py-3 font-mono text-slate-500">{ev.ip}</td>
                      <td className="py-3 text-slate-400">{ev.timestamp}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No security audit events recorded in database.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL: VIEW DETAILS FORENSICS */}
        <AnimatePresence>
          {viewDetailsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-mono text-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-2xl space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye size={18} className="text-blue-500" /> {viewDetailsModal.title}
                  </h3>
                  <button onClick={() => setViewDetailsModal(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"><X size={16} /></button>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Target Account</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold">{viewDetailsModal.data.targetEmail}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Client IP & Location</span>
                      <strong className="text-blue-600 dark:text-cyan-400 font-extrabold">{viewDetailsModal.data.ip} ({viewDetailsModal.data.location})</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Event Timestamp</span>
                      <strong className="text-rose-600 dark:text-rose-400 font-extrabold">{viewDetailsModal.data.timestamp}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button onClick={() => setViewDetailsModal(null)} className="py-2 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold cursor-pointer">Close Forensics</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

export default SecurityCenter;
