import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, FileCheck, Building2, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { getMyNotifications } from "../../services/notificationService";

function DashboardNotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyNotifications()
      .then((res) => {
        const data = Array.isArray(res) ? res : (res?.data || []);
        setNotifications(data);
      })
      .catch((err) => {
        console.error("Failed to load notifications from backend", err);
        setNotifications([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getNotifIcon = (type) => {
    const t = (type || "").toUpperCase();
    if (t.includes("REPORT")) {
      return <FileCheck size={14} className="text-blue-600 dark:text-cyan-400" />;
    }
    if (t.includes("PROPERTY")) {
      return <Building2 size={14} className="text-emerald-600 dark:text-emerald-400" />;
    }
    if (t.includes("RISK")) {
      return <ShieldAlert size={14} className="text-amber-600 dark:text-amber-400" />;
    }
    return <CheckCircle2 size={14} className="text-purple-600 dark:text-purple-400" />;
  };

  return (
    <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#334155]">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-blue-600 dark:text-cyan-400" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Notifications & System Alerts
          </h3>
        </div>
        <button
          onClick={() => navigate("/notifications")}
          className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>View All</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-2.5">
          {notifications.map((notif, idx) => (
            <motion.div
              key={notif.notificationId || notif.id || idx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.04 * idx }}
              onClick={() => navigate("/notifications")}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 text-xs ${
                !notif.isRead
                  ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 shadow-xs"
                  : "bg-slate-50/50 dark:bg-[#0F172A]/40 border-slate-200/50 dark:border-[#334155]"
              }`}
            >
              <div className="p-2 rounded-xl bg-white dark:bg-[#1E293B] shadow-xs shrink-0 mt-0.5">
                {getNotifIcon(notif.notificationType || notif.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white truncate">
                    {notif.title || notif.notificationType}
                  </h4>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-[#CBD5E1] line-clamp-2 leading-snug">
                  {notif.message}
                </p>

                <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
                  {notif.sentAt ? new Date(notif.sentAt).toLocaleString('en-GB') : "Recently"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-4">No notifications present in database.</p>
      )}
    </div>
  );
}

export default DashboardNotificationCenter;
