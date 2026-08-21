import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Home,
  ChevronRight,
  Filter,
  Search,
  Building2,
  FileText,
  Eye,
  RefreshCw,
  AlertCircle,
  Bell,
  CheckCheck,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Plus,
  X,
  Edit2,
  Trash2,
  User,
  Users,
  MapPin,
  CheckSquare,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import { showToast, showConfirmDialog, showSuccessAlert } from "../utils/swal";
import {
  getMyNotifications,
  markNotificationAsRead,
} from "../services/notificationService";
import { getMyReports } from "../services/reportService";
import { getMyProperties, getAllProperties } from "../services/propertyService";

const STORAGE_KEY = "agent_scheduled_tasks";

function AgentTasks() {
  const navigate = useNavigate();

  // State Management
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [sortBy, setSortBy] = useState("DATE_DESC");

  // Add / Edit Task Modal State
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    type: "PROPERTY_VISIT",
    propertyId: "",
    clientName: "",
    dueDate: new Date().toISOString().slice(0, 10),
    dueTime: "10:00 AM",
    priority: "HIGH",
    status: "PENDING",
    notes: "",
  });

  // Load custom tasks from local store
  const loadUserTasks = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to parse user tasks:", e);
    }
    return [];
  };

  // Save custom tasks to local store
  const saveUserTasks = (updatedTasks) => {
    setTasks(updatedTasks);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (e) {
      console.warn("Failed to persist user tasks:", e);
    }
  };

  // Fetch real authenticated agent workflow activities from PostgreSQL
  const fetchAgentActivity = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel fetch from genuine backend endpoints
      const [notifRes, repRes, propRes] = await Promise.allSettled([
        getMyNotifications(),
        getMyReports(),
        getMyProperties(0, 50),
      ]);

      const notifsList =
        notifRes.status === "fulfilled"
          ? Array.isArray(notifRes.value.data)
            ? notifRes.value.data
            : Array.isArray(notifRes.value)
            ? notifRes.value
            : []
          : [];

      const reportsList =
        repRes.status === "fulfilled"
          ? Array.isArray(repRes.value.data)
            ? repRes.value.data
            : Array.isArray(repRes.value)
            ? repRes.value
            : []
          : [];

      const propsList =
        propRes.status === "fulfilled"
          ? propRes.value?.data?.content ||
            (Array.isArray(propRes.value?.data) ? propRes.value.data : [])
          : [];

      setNotifications(notifsList);
      setReports(reportsList);
      setProperties(propsList);

      const userSavedTasks = loadUserTasks();
      setTasks(userSavedTasks);

      // Combine real PostgreSQL events + Agent Scheduled Tasks into unified chronological feed
      const combined = [];

      // 1. Map Agent Scheduled Tasks
      userSavedTasks.forEach((t) => {
        const pMatch = propsList.find((p) => String(p.propertyId || p.id) === String(t.propertyId));
        combined.push({
          id: t.id,
          rawId: t.id,
          type: "SCHEDULED_TASK",
          taskType: t.type || "PROPERTY_VISIT",
          category: t.type ? t.type.replace(/_/g, " ") : "Scheduled Task",
          title: t.title,
          description: t.notes || `Scheduled ${t.type ? t.type.replace(/_/g, " ") : "task"} with ${t.clientName || "Client"}.`,
          status: t.status || "PENDING",
          priority: t.priority || "HIGH",
          clientName: t.clientName,
          dueDate: t.dueDate,
          dueTime: t.dueTime,
          timestamp: new Date(t.createdAt || t.dueDate || Date.now()),
          propertyId: t.propertyId || pMatch?.propertyId,
          propertyName: pMatch?.propertyName || t.propertyName,
          isUserTask: true,
          taskData: t,
        });
      });

      // 2. Map Real Notifications
      notifsList.forEach((n) => {
        combined.push({
          id: `NOTIF-${n.notificationId}`,
          rawId: n.notificationId,
          type: "NOTIFICATION",
          category: n.notificationType || "SYSTEM_ALERT",
          title: n.title || "System Notification",
          description: n.message || "Notification received from system.",
          isRead: Boolean(n.isRead),
          timestamp: n.sentAt ? new Date(n.sentAt) : new Date(),
          propertyId: n.property?.propertyId,
          propertyName: n.property?.propertyName,
          reportId: n.report?.reportId,
        });
      });

      // 3. Map Real Reports Generated
      reportsList.forEach((r) => {
        combined.push({
          id: `REP-${r.reportId}`,
          rawId: r.reportId,
          type: "AUDIT_REPORT",
          category: "DUE_DILIGENCE",
          title: r.reportName || `Due Diligence Dossier #${r.reportId}`,
          description: r.executiveSummary
            ? r.executiveSummary.substring(0, 160) + "..."
            : "Comprehensive due diligence report compiled and registered.",
          status: r.reportStatus || "GENERATED",
          timestamp: r.createdAt ? new Date(r.createdAt) : new Date(),
          propertyId: r.property?.propertyId,
          propertyName: r.property?.propertyName || `Property #${r.property?.propertyId}`,
          riskScore: r.riskScore,
        });
      });

      // 4. Map Real Properties Managed
      propsList.forEach((p) => {
        const pId = p.propertyId || p.id;
        combined.push({
          id: `PROP-${pId}`,
          rawId: pId,
          type: "PROPERTY_ASSET",
          category: "PORTFOLIO",
          title: `Managed Property: ${p.propertyName}`,
          description: `${p.city || "Urban Region"}, ${p.state || "India"} • Valuation: ₹ ${(
            Number(p.marketValue || 0) / 10000000
          ).toFixed(2)} Cr`,
          status: p.status || "ACTIVE",
          timestamp: p.createdAt ? new Date(p.createdAt) : new Date(Date.now() - 86400000),
          propertyId: pId,
          propertyName: p.propertyName,
        });
      });

      setActivities(combined);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Failed to load agent activity & schedule:", err);
      setError("Unable to load your schedule from backend server. Please verify Spring Boot is running.");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentActivity();
  }, []);

  // Open Create Task Dialog
  const handleOpenCreateTaskModal = () => {
    setEditingTask(null);
    setTaskForm({
      title: "",
      type: "PROPERTY_VISIT",
      propertyId: properties.length > 0 ? String(properties[0].propertyId || properties[0].id) : "",
      clientName: "",
      dueDate: new Date().toISOString().slice(0, 10),
      dueTime: "10:00 AM",
      priority: "HIGH",
      status: "PENDING",
      notes: "",
    });
    setTaskModalOpen(true);
  };

  // Open Edit Task Dialog
  const handleOpenEditTaskModal = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      type: task.type || task.taskType || "PROPERTY_VISIT",
      propertyId: String(task.propertyId || ""),
      clientName: task.clientName || "",
      dueDate: task.dueDate || new Date().toISOString().slice(0, 10),
      dueTime: task.dueTime || "10:00 AM",
      priority: task.priority || "HIGH",
      status: task.status || "PENDING",
      notes: task.notes || task.description || "",
    });
    setTaskModalOpen(true);
  };

  // Save Task Form Submission
  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      showToast("Please enter a task title.", "warning");
      return;
    }

    const matchedProp = properties.find((p) => String(p.propertyId || p.id) === String(taskForm.propertyId));

    if (editingTask) {
      // Update existing task
      const updated = tasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              ...taskForm,
              propertyName: matchedProp?.propertyName || t.propertyName,
              updatedAt: new Date().toISOString(),
            }
          : t
      );
      saveUserTasks(updated);
      showSuccessAlert("Task Updated", `"${taskForm.title}" has been updated successfully.`);
    } else {
      // Create new task
      const newTask = {
        id: `TASK-${Date.now()}`,
        ...taskForm,
        propertyName: matchedProp?.propertyName || "",
        createdAt: new Date().toISOString(),
      };
      const updated = [newTask, ...tasks];
      saveUserTasks(updated);
      showSuccessAlert("Task Scheduled", `"${taskForm.title}" has been added to your work schedule.`);
    }

    setTaskModalOpen(false);
    fetchAgentActivity();
  };

  // Delete Task
  const handleDeleteTask = async (taskId) => {
    const confirmed = await showConfirmDialog({
      title: "Delete Scheduled Task",
      text: "Are you sure you want to remove this task from your work schedule?",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      icon: "warning",
    });

    if (confirmed) {
      const updated = tasks.filter((t) => t.id !== taskId);
      saveUserTasks(updated);
      fetchAgentActivity();
      showToast("Task removed from schedule.", "info");
    }
  };

  // Toggle Task Completion
  const handleToggleTaskStatus = (taskId) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const nextStatus = t.status === "COMPLETED" ? "PENDING" : "COMPLETED";
        return { ...t, status: nextStatus };
      }
      return t;
    });
    saveUserTasks(updated);
    fetchAgentActivity();
    showToast("Task status updated.", "success");
  };

  // Handle Mark Notification as Read
  const handleMarkAsRead = async (notifId) => {
    try {
      await markNotificationAsRead(notifId);
      setActivities((prev) =>
        prev.map((item) =>
          item.type === "NOTIFICATION" && item.rawId === notifId ? { ...item, isRead: true } : item
        )
      );
      showToast("Notification marked as read.", "success");
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // Filter Logic
  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const matchType = filterType === "ALL" || item.type === filterType;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.propertyName && item.propertyName.toLowerCase().includes(q)) ||
        (item.clientName && item.clientName.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q);

      return matchType && matchSearch;
    });
  }, [activities, filterType, searchQuery]);

  // Sort Logic
  const sortedActivities = useMemo(() => {
    const list = [...filteredActivities];
    if (sortBy === "DATE_DESC") {
      list.sort((a, b) => b.timestamp - a.timestamp);
    } else if (sortBy === "DATE_ASC") {
      list.sort((a, b) => a.timestamp - b.timestamp);
    } else if (sortBy === "TITLE_ASC") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [filteredActivities, sortBy]);

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* BREADCRUMB HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500 dark:text-[#CBD5E1]">
          <nav className="flex items-center gap-2">
            <Link to="/agent/dashboard" className="hover:text-blue-600 dark:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Home size={14} /> Agent Workspace
            </Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Activity & Work Schedule
            </span>
          </nav>

          <div className="flex items-center gap-3">
            {lastSyncTime && (
              <span className="text-[11px] text-slate-400">
                Synced {lastSyncTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <Button
              variant="outline"
              size="xs"
              onClick={fetchAgentActivity}
              loading={loading}
              icon={RefreshCw}
            >
              Sync
            </Button>
          </div>
        </div>

        {/* ERROR STATE BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <div>
                <p className="font-bold">Unable to load your schedule</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
              </div>
            </div>
            <Button variant="danger" size="xs" onClick={fetchAgentActivity}>
              Retry
            </Button>
          </div>
        )}

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              <ClipboardList size={13} /> Live Work Pipeline & Activity Feed
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              📅 Activity & Work Schedule
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] max-w-2xl">
              Manage property visits, client meetings, document follow-ups, inspections, and due diligence tasks.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* REQUIRED ADD TASK BUTTON */}
            <Button
              onClick={handleOpenCreateTaskModal}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              Add Task
            </Button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Managed Parcels</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? "..." : properties.length}
              </strong>
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
                <Building2 size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Scheduled Tasks</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {loading ? "..." : tasks.length}
              </strong>
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Calendar size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Generated Reports</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {loading ? "..." : reports.length}
              </strong>
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <FileText size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Alerts & Notifs</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {loading ? "..." : notifications.length}
              </strong>
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Bell size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="white-card rounded-3xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks, visits, clients, properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Category */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <Filter size={12} className="text-slate-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Schedule ({activities.length})</option>
                <option value="SCHEDULED_TASK">Scheduled Tasks ({tasks.length})</option>
                <option value="AUDIT_REPORT">Due Diligence Reports ({reports.length})</option>
                <option value="NOTIFICATION">Notifications & Alerts ({notifications.length})</option>
                <option value="PROPERTY_ASSET">Managed Properties ({properties.length})</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <Clock size={12} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="DATE_DESC">Newest First</option>
                <option value="DATE_ASC">Oldest First</option>
                <option value="TITLE_ASC">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-3xl" />
            <Skeleton className="h-24 w-full rounded-3xl" />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && activities.length === 0 && (
          <div className="py-12">
            <EmptyState
              title="No Tasks or Activity Yet"
              message="Schedule your first property visit or due diligence task."
              actionLabel="Add Task"
              onAction={handleOpenCreateTaskModal}
            />
          </div>
        )}

        {/* SEARCH EMPTY STATE */}
        {!loading && !error && activities.length > 0 && sortedActivities.length === 0 && (
          <div className="py-8">
            <EmptyState
              title="No matching activities"
              message={`No task or event matched "${searchQuery}".`}
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery("");
                setFilterType("ALL");
              }}
            />
          </div>
        )}

        {/* ACTIVITY & SCHEDULE TIMELINE FEED */}
        {!loading && !error && sortedActivities.length > 0 && (
          <div className="space-y-4">
            {sortedActivities.map((act) => {
              const isTask = act.type === "SCHEDULED_TASK";
              const isReport = act.type === "AUDIT_REPORT";
              const isNotif = act.type === "NOTIFICATION";
              const isProp = act.type === "PROPERTY_ASSET";

              return (
                <div
                  key={act.id}
                  className={`glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors ${
                    isTask
                      ? act.status === "COMPLETED"
                        ? "opacity-75 bg-slate-50/50 dark:bg-[#1E293B]/50"
                        : "border-amber-200 dark:border-amber-800 hover:border-amber-400"
                      : isNotif && !act.isRead
                      ? "border-blue-300 dark:border-blue-700 bg-blue-50/20"
                      : "hover:border-blue-400 dark:hover:border-cyan-500"
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`p-3 rounded-2xl shrink-0 ${
                        isTask
                          ? act.status === "COMPLETED"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
                          : isReport
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                          : isNotif
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                          : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400"
                      }`}
                    >
                      {isTask ? (
                        act.status === "COMPLETED" ? <CheckCircle2 size={20} /> : <Calendar size={20} />
                      ) : isReport ? (
                        <FileText size={20} />
                      ) : isNotif ? (
                        <Bell size={20} />
                      ) : (
                        <Building2 size={20} />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400">
                          {act.id}
                        </span>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#334155]">
                          {act.category.replace(/_/g, " ")}
                        </span>

                        {isTask && (
                          <>
                            <Badge variant={act.priority === "HIGH" ? "danger" : act.priority === "MEDIUM" ? "warning" : "info"}>
                              {act.priority} PRIORITY
                            </Badge>
                            <Badge variant={act.status === "COMPLETED" ? "success" : "warning"}>
                              {act.status}
                            </Badge>
                          </>
                        )}

                        {isNotif && !act.isRead && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                            NEW
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={11} />
                          {act.dueDate ? `${act.dueDate} • ${act.dueTime || "10:00 AM"}` : (
                            <>
                              {act.timestamp.toLocaleDateString([], {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              •{" "}
                              {act.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </>
                          )}
                        </span>
                      </div>

                      <h3
                        className={`font-extrabold text-sm ${
                          isTask && act.status === "COMPLETED"
                            ? "line-through text-slate-400"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {act.title}
                      </h3>

                      <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                        {act.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 font-bold">
                        {act.propertyName && (
                          <span className="flex items-center gap-1">
                            <Building2 size={11} className="text-blue-500" />
                            <span>Property: {act.propertyName}</span>
                          </span>
                        )}
                        {act.clientName && (
                          <span className="flex items-center gap-1">
                            <User size={11} className="text-indigo-500" />
                            <span>Client: {act.clientName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                    {/* User Task Actions */}
                    {isTask && (
                      <>
                        <Button
                          onClick={() => handleToggleTaskStatus(act.rawId)}
                          variant={act.status === "COMPLETED" ? "outline" : "success"}
                          size="xs"
                          icon={CheckSquare}
                        >
                          {act.status === "COMPLETED" ? "Reopen" : "Done"}
                        </Button>
                        <Button
                          onClick={() => handleOpenEditTaskModal(act.taskData || act)}
                          variant="secondary"
                          size="xs"
                          icon={Edit2}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteTask(act.rawId)}
                          variant="danger"
                          size="xs"
                          icon={Trash2}
                        />
                      </>
                    )}

                    {act.propertyId && (
                      <Button
                        onClick={() => navigate(`/property-details?id=${act.propertyId}`)}
                        variant="outline"
                        size="xs"
                        icon={Eye}
                      >
                        Inspect
                      </Button>
                    )}

                    {isReport && (
                      <Button
                        onClick={() => navigate(`/due-diligence-report?id=${act.propertyId || 1}`)}
                        variant="primary"
                        size="xs"
                        icon={ShieldCheck}
                      >
                        View Dossier
                      </Button>
                    )}

                    {isNotif && !act.isRead && (
                      <Button
                        onClick={() => handleMarkAsRead(act.rawId)}
                        variant="secondary"
                        size="xs"
                        icon={CheckCheck}
                      >
                        Mark Read
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD / EDIT TASK DIALOG MODAL */}
        <AnimatePresence>
          {taskModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setTaskModalOpen(false)}
                className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1 }}
                className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#334155]">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar size={18} className="text-blue-600 dark:text-cyan-400" />
                      {editingTask ? "Edit Scheduled Task" : "Schedule New Agent Task"}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Add a site inspection, client consultation, or due diligence milestone.
                    </p>
                  </div>
                  <button
                    onClick={() => setTaskModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveTask} className="space-y-4 font-mono text-xs">
                  {/* Task Title */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gachibowli Villa Due Diligence & Site Verification"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  {/* Task Type & Priority */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-400">
                        Task Type
                      </label>
                      <select
                        value={taskForm.type}
                        onChange={(e) => setTaskForm({ ...taskForm, type: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                      >
                        <option value="PROPERTY_VISIT">Property Visit</option>
                        <option value="CLIENT_MEETING">Client Meeting</option>
                        <option value="DOCUMENT_FOLLOWUP">Document Follow-up</option>
                        <option value="DUE_DILIGENCE_REVIEW">Due Diligence Review</option>
                        <option value="INSPECTION">Site Inspection</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-400">
                        Priority Level
                      </label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                      >
                        <option value="HIGH">High Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="LOW">Low Priority</option>
                      </select>
                    </div>
                  </div>

                  {/* Property Association from Real Catalog */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                      Associated Property
                    </label>
                    <select
                      value={taskForm.propertyId}
                      onChange={(e) => setTaskForm({ ...taskForm, propertyId: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                    >
                      <option value="">-- No Property Link --</option>
                      {properties.map((p) => {
                        const id = p.propertyId || p.id;
                        return (
                          <option key={id} value={String(id)}>
                            {p.propertyName} ({p.propertyCode || `PR-${id}`})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Client / Contact Name */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                      Client / Stakeholder Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Reddy (Prospective Buyer)"
                      value={taskForm.clientName}
                      onChange={(e) => setTaskForm({ ...taskForm, clientName: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-400">
                        Schedule Date
                      </label>
                      <input
                        type="date"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                      >
                      </input>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-400">
                        Schedule Time
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 10:30 AM"
                        value={taskForm.dueTime}
                        onChange={(e) => setTaskForm({ ...taskForm, dueTime: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  </div>

                  {/* Task Status */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                      Initial Status
                    </label>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>

                  {/* Notes / Details */}
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                      Task Notes & Instructions
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Verify boundary coordinates with sub-registrar survey maps..."
                      value={taskForm.notes}
                      onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  {/* Form Footer Actions */}
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#334155]">
                    <Button
                      type="button"
                      onClick={() => setTaskModalOpen(false)}
                      variant="secondary"
                      size="xs"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="xs" icon={Plus}>
                      {editingTask ? "Save Changes" : "Schedule Task"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

export default AgentTasks;
