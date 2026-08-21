import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  Bell,
  CheckCheck,
  Building2,
  Users,
  FileText,
  Clock,
  Search,
  Filter,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
  Send,
  Calendar,
  Check,
  X,
  UserPlus,
  Home,
  ShieldCheck,
  Eye,
  Sparkles,
  AlertOctagon,
  AlertTriangle,
  RotateCcw,
  FileUp,
  UserCheck,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";
import { showToast, showConfirmDialog, showSuccessAlert, showErrorAlert } from "../utils/swal";
import {
  getMyNotifications,
  getMyUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearReadNotifications,
} from "../services/notificationService";

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

function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [readFilter, setReadFilter] = useState("ALL"); // ALL, UNREAD, READ

  // Load live notifications and unread count from backend
  const fetchNotifications = useCallback(async (isManual = false) => {
    try {
      if (isManual) setSyncing(true);
      else setLoading(true);
      setError(null);

      const [listRes, countRes] = await Promise.allSettled([
        getMyNotifications(),
        getMyUnreadCount(),
      ]);

      if (listRes.status === "fulfilled" && listRes.value) {
        const rawList = Array.isArray(listRes.value) ? listRes.value : (listRes.value?.data || []);
        const formatted = rawList.map((item) => ({
          id: item.notificationId || item.id,
          type: item.notificationType || item.type || "System Alert",
          title: item.title || "Notification Update",
          message: item.message || "",
          property: item.propertyName || (item.propertyId ? `Property #${item.propertyId}` : "General"),
          propertyId: item.propertyId || null,
          reportId: item.reportId || null,
          reportName: item.reportName || null,
          userEmail: item.userEmail || "",
          rawDate: item.sentAt || item.createdAt,
          timestamp: formatRelativeTime(item.sentAt || item.createdAt),
          read: item.isRead === true,
          priority: (item.notificationType || "").toUpperCase().includes("RISK") ? "CRITICAL" : "NORMAL",
        }));
        setNotifications(formatted);
      } else {
        setNotifications([]);
      }

      if (countRes.status === "fulfilled" && countRes.value != null) {
        const cnt = typeof countRes.value === "number" ? countRes.value : Number(countRes.value?.data || 0);
        setUnreadCount(cnt);
      } else {
        setUnreadCount(0);
      }

      const nowStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSyncTime(nowStr);

      if (isManual) {
        showToast("Notification feed synced with PostgreSQL database", "success");
      }
    } catch (err) {
      console.error("Failed to load notifications from backend:", err);
      setError("Unable to load notifications from backend database. Please verify Spring Boot connection.");
      setNotifications([]);
      setUnreadCount(0);
      if (isManual) {
        showToast("Failed to refresh notification feed", "error");
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Extract unique notification types dynamically from backend records
  const availableTypes = useMemo(() => {
    const types = new Set();
    notifications.forEach((n) => {
      if (n.type) types.add(n.type);
    });
    return Array.from(types);
  }, [notifications]);

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((ntf) => {
      // Type Filter
      const matchType = typeFilter === "ALL" || ntf.type === typeFilter;

      // Read / Unread Filter
      const matchRead =
        readFilter === "ALL" ||
        (readFilter === "UNREAD" && !ntf.read) ||
        (readFilter === "READ" && ntf.read);

      // Search Query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ntf.title.toLowerCase().includes(q) ||
        ntf.message.toLowerCase().includes(q) ||
        ntf.property.toLowerCase().includes(q) ||
        ntf.type.toLowerCase().includes(q) ||
        ntf.timestamp.toLowerCase().includes(q);

      return matchType && matchRead && matchSearch;
    });
  }, [notifications, typeFilter, readFilter, searchQuery]);

  // ACTION: MARK READ (SINGLE)
  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      showToast("Notification marked as read in database", "info");
      fetchNotifications(false);
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      showErrorAlert("Update Failed", "Could not mark notification as read in backend.");
    }
  };

  // ACTION: MARK ALL READ
  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      showSuccessAlert("All Marked Read", "All pending notifications marked as read in PostgreSQL.");
      fetchNotifications(false);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      showErrorAlert("Update Failed", "Could not update notification statuses in database.");
    }
  };

  // ACTION: DELETE (SINGLE)
  const handleDeleteNotification = async (id) => {
    const confirmed = await showConfirmDialog(
      "Delete Notification?",
      "Are you sure you want to permanently delete this notification from your database feed?",
      "Delete",
      "Cancel"
    );
    if (!confirmed) return;

    try {
      await deleteNotification(id);
      showToast("Notification deleted from database", "info");
      fetchNotifications(false);
    } catch (err) {
      console.error("Failed to delete notification:", err);
      showErrorAlert("Deletion Failed", "Could not remove notification record.");
    }
  };

  // ACTION: CLEAR READ NOTIFICATIONS
  const handleClearRead = async () => {
    const readCount = notifications.filter((n) => n.read).length;
    if (readCount === 0) {
      showToast("No read notifications to clear", "info");
      return;
    }

    const confirmed = await showConfirmDialog(
      "Clear Read Notifications?",
      `Are you sure you want to delete all ${readCount} read notifications from PostgreSQL?`,
      "Clear Read",
      "Cancel"
    );
    if (!confirmed) return;

    try {
      await clearReadNotifications();
      showSuccessAlert("Read Notifications Cleared", `${readCount} read notifications removed from PostgreSQL.`);
      fetchNotifications(false);
    } catch (err) {
      console.error("Failed to clear read notifications:", err);
      showErrorAlert("Clear Failed", "Could not remove read notifications.");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-amber-500 dark:text-amber-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              System Notifications & Alert Center
            </span>
          </div>

          {/* DYNAMIC UNREAD BADGE COUNTER FROM BACKEND */}
          <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono font-bold text-xs border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${unreadCount > 0 ? "bg-amber-500 animate-pulse" : "bg-slate-400"}`} />
            {unreadCount} UNREAD
          </span>
        </div>

        {/* HERO BANNER & BULK ACTIONS */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-mono font-bold mb-2">
              <Bell size={14} /> Dispatch & Telemetry Stream
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              🔔 Notifications Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              Real-time dispatches for assigned reviews, uploaded documents, ownership updates, expired permits, and high risk properties in PostgreSQL.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => fetchNotifications(true)}
              variant="outline"
              size="sm"
              icon={RotateCcw}
              loading={syncing || loading}
            >
              {syncing ? "Syncing..." : lastSyncTime ? `Sync (${lastSyncTime})` : "Refresh Feed"}
            </Button>

            <Button
              onClick={handleMarkAllRead}
              variant="outline"
              size="sm"
              icon={CheckCheck}
              disabled={unreadCount === 0}
            >
              Mark All Read
            </Button>
            <Button
              onClick={handleClearRead}
              variant="danger"
              size="sm"
              icon={Trash2}
              disabled={notifications.filter((n) => n.read).length === 0}
            >
              Clear Read
            </Button>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-xs flex items-center justify-between">
            <span>⚠️ {error}</span>
            <Button onClick={() => fetchNotifications(true)} variant="danger" size="xs">Retry</Button>
          </div>
        )}

        {/* CONTROLS BAR: SEARCH, TYPE FILTER, READ/UNREAD FILTER */}
        <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Notification Title, Message, Type, or Time..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] font-bold text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Notification Type Dropdown Filter */}
            <div className="sm:col-span-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">All {availableTypes.length > 0 ? availableTypes.length : ""} Notification Types</option>
                {availableTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Read / Unread Status Dropdown Filter */}
            <div className="sm:col-span-3">
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="ALL">All Read & Unread ({notifications.length})</option>
                <option value="UNREAD">Unread Only ({unreadCount})</option>
                <option value="READ">Read Only ({notifications.length - unreadCount})</option>
              </select>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS FEED LIST */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-3xl" />
            <Skeleton className="h-20 w-full rounded-3xl" />
            <Skeleton className="h-20 w-full rounded-3xl" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <EmptyState
            title={unreadCount === 0 && readFilter === "UNREAD" ? "All caught up" : "No notifications found"}
            message={
              searchQuery
                ? `No notification dispatch matches "${searchQuery}".`
                : unreadCount === 0 && readFilter === "UNREAD"
                ? "You have 0 unread notifications in your feed."
                : "No notification dispatches recorded in your backend feed."
            }
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredNotifications.map((ntf) => (
                <motion.div
                  key={ntf.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`p-5 rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:shadow-md ${
                    !ntf.read
                      ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/80"
                      : "bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155]"
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Unread Indicator Dot & Type Icon */}
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      {!ntf.read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" title="Unread Notification" />
                      )}
                      <div className={`p-2.5 rounded-2xl border ${
                        ntf.priority === "CRITICAL"
                          ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-800"
                          : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/80 dark:text-amber-400 dark:border-amber-800"
                      }`}>
                        <Bell size={18} />
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                          {ntf.type} • NTF-{ntf.id}
                        </span>
                        <span className="text-slate-400 text-[10px] font-bold">• {ntf.timestamp}</span>
                        {ntf.priority === "CRITICAL" && (
                          <Badge variant="danger">CRITICAL</Badge>
                        )}
                        {!ntf.read && (
                          <Badge variant="warning">NEW</Badge>
                        )}
                      </div>

                      <h3 className={`text-sm font-extrabold leading-snug ${
                        !ntf.read ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300"
                      }`}>
                        {ntf.title}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                        {ntf.message}
                      </p>

                      {ntf.property && ntf.property !== "General" && (
                        <p className="text-[11px] font-bold text-slate-500 pt-1">
                          🏢 {ntf.property}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS: MARK READ, DELETE, VIEW PROPERTY */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#334155]">
                    {!ntf.read && (
                      <button
                        onClick={() => handleMarkAsRead(ntf.id)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-cyan-300 font-bold transition-all flex items-center gap-1 cursor-pointer border border-blue-200 dark:border-blue-800"
                        title="Mark as Read"
                      >
                        <Check size={14} />
                        <span>Mark Read</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteNotification(ntf.id)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
                      title="Delete Notification"
                    >
                      <Trash2 size={15} />
                    </button>

                    {ntf.propertyId && (
                      <button
                        onClick={() => navigate(`/property-details?id=${ntf.propertyId}`)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                        title="Inspect Property Parcel"
                      >
                        <ArrowUpRight size={15} />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default NotificationCenter;
