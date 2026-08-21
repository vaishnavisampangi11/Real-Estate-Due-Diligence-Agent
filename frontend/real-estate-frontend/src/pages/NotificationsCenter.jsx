import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import {
  Bell,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  CheckCheck,
  UserPlus,
  Building2,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Server,
  Lock,
  Clock,
  Sparkles,
  X,
} from "lucide-react";
import { showSuccessAlert, showToast, showConfirmDialog } from "../utils/swal";
import { getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from "../services/notificationService";

function NotificationsCenter() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load live notifications from backend
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyNotifications();
      const rawList = Array.isArray(res) ? res : res?.data || [];
      const formatted = rawList.map((item) => ({
        id: item.notificationId || item.id || `NOTIF-${Math.random()}`,
        type: item.type || "System Alert",
        title: item.title || "Notification Update",
        message: item.message || "",
        timestamp: item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently",
        read: item.isRead || item.read || false,
        icon: item.type?.includes("Security") ? Lock : item.type?.includes("Risk") ? ShieldAlert : item.type?.includes("Report") ? FileText : Building2,
        color: item.type?.includes("Security") ? "rose" : item.type?.includes("Risk") ? "amber" : "blue",
      }));
      setNotifications(formatted);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to connect to notification service. Please verify backend is running on port 8081.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, UNREAD, READ

  // Unread Badge Count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Filter & Search Logic
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.type.toLowerCase().includes(q) ||
        n.timestamp.toLowerCase().includes(q);

      const matchesType = typeFilter === "ALL" || n.type === typeFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "UNREAD" && !n.read) ||
        (statusFilter === "READ" && n.read);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [notifications, searchQuery, typeFilter, statusFilter]);

  // Handlers
  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    showToast("Notification marked as read", "info");
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showSuccessAlert("All Marked as Read", "All notifications have been marked as read.");
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast("Notification deleted", "info");
  };

  const handleClearReadNotifications = async () => {
    const confirmed = await showConfirmDialog(
      "Clear Read Notifications?",
      "Are you sure you want to remove all read notification items?",
      "Clear Notifications",
      "Cancel"
    );
    if (confirmed) {
      setNotifications((prev) => prev.filter((n) => !n.read));
      showToast("Read notifications cleared", "success");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* HEADER BAR WITH UNREAD BADGE */}
        <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 font-bold mb-2">
              <Bell size={14} /> Real-Time System Notification Stream
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Notifications Center
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-rose-500 text-white font-extrabold text-xs shadow-xs animate-pulse">
                  {unreadCount} UNREAD
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Audit alerts for New Users, Property Additions, Reports, API Errors, High Risk Flags, Server Infrastructure, and Security Events.
            </p>
          </div>

          {/* BULK ACTION BUTTONS */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="py-2.5 px-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCheck size={14} />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              onClick={handleClearReadNotifications}
              className="py-2.5 px-3.5 rounded-2xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 size={14} />
              <span>Clear Read</span>
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* SEARCH */}
            <div className="lg:col-span-5 relative">
              <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Notification Title, Message, Type, or Time..."
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
              />
            </div>

            {/* FILTER BY ALL 7 NOTIFICATION TYPES */}
            <div className="lg:col-span-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-medium cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All 7 Notification Types</option>
                <option value="New User Registered">1. New User Registered</option>
                <option value="Property Added">2. Property Added</option>
                <option value="Report Generated">3. Report Generated</option>
                <option value="API Failure">4. API Failure</option>
                <option value="High Risk Property">5. High Risk Property</option>
                <option value="Server Alert">6. Server Alert</option>
                <option value="Security Alert">7. Security Alert</option>
              </select>
            </div>

            {/* READ / UNREAD STATUS FILTER */}
            <div className="lg:col-span-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2.5 px-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-medium cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Read & Unread</option>
                <option value="UNREAD">Unread Only ({unreadCount})</option>
                <option value="READ">Read Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* NOTIFICATIONS STREAM LIST */}
        {filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notif) => {
              const IconComp = notif.icon || Bell;
              const isUnread = !notif.read;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isUnread
                      ? "border-blue-400 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-950/20"
                      : "border-slate-200 dark:border-[#334155] opacity-80"
                  }`}
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className={`p-3.5 rounded-2xl shrink-0 border ${
                      notif.color === "rose"
                        ? "bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800"
                        : notif.color === "amber"
                        ? "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                        : notif.color === "purple"
                        ? "bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
                        : notif.color === "emerald"
                        ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                        : "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 border-blue-200 dark:border-blue-800"
                    }`}>
                      <IconComp size={20} />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {notif.title}
                        </span>
                        <Badge variant={isUnread ? "primary" : "secondary"}>
                          {notif.type}
                        </Badge>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        )}
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                        {notif.message}
                      </p>

                      <span className="text-[10px] text-slate-400 font-mono block">
                        {notif.timestamp} • {notif.id}
                      </span>
                    </div>
                  </div>

                  {/* ACTION BUTTONS (MARK READ / DELETE) */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isUnread && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="py-1.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                        title="Mark as Read"
                      >
                        <CheckCircle2 size={13} />
                        <span>Mark Read</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteNotification(notif.id)}
                      className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 font-bold transition-all cursor-pointer"
                      title="Delete Notification"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="white-card rounded-3xl p-12 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs text-center">
            <EmptyState
              title="No Notifications Found"
              description="No audit notifications match your current search query or filter parameters."
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default NotificationsCenter;
