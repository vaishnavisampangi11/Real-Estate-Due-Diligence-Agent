import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { Skeleton } from "../components/common/Skeleton";
import {
  Server,
  Database,
  Globe,
  HardDrive,
  Cpu,
  Activity,
  Clock,
  Code,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Radio,
  Layers,
  Sparkles,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { showToast } from "../utils/swal";
import { getSystemMonitoringTelemetry } from "../services/adminService";

// Helper to format uptime duration
const formatUptime = (seconds) => {
  if (!seconds && seconds !== 0) return "0m";
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const parts = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0 || d > 0) parts.push(`${h}h`);
  if (m > 0 || h > 0 || d > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);

  return parts.join(" ");
};

function SystemMonitoring() {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState("");
  const [error, setError] = useState(null);

  const fetchTelemetry = useCallback(async (isManual = false) => {
    try {
      if (isManual) setIsRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await getSystemMonitoringTelemetry();
      const data = res?.data || res;
      setTelemetry(data);

      const nowStr = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLastRefreshed(nowStr);

      if (isManual) {
        showToast("Live runtime telemetry refreshed from Spring Boot", "success");
      }
    } catch (err) {
      console.error("Failed to load system monitoring telemetry:", err);
      setError("Unable to connect to system monitoring telemetry endpoint. Please check Spring Boot backend.");
      setTelemetry(null);
      if (isManual) {
        showToast("Failed to refresh system telemetry", "error");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();

    // Auto-refresh polling every 30 seconds
    const interval = setInterval(() => {
      fetchTelemetry(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const backend = telemetry?.backend;
  const database = telemetry?.database;
  const api = telemetry?.api;
  const memory = telemetry?.memory;
  const cpu = telemetry?.cpu;
  const storage = telemetry?.storage;
  const application = telemetry?.application;

  const isDbHealthy = (database?.status || "").toUpperCase() === "OPERATIONAL";

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* HEADER BAR WITH LIVE STATUS INDICATOR */}
        <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Infrastructure & JVM Telemetry
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              System Monitoring
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live JVM runtime allocation, CPU load, PostgreSQL database cluster connectivity, and REST API response times.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => fetchTelemetry(true)}
              disabled={isRefreshing || loading}
              className="py-2.5 px-4 rounded-2xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-2"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-blue-500" : ""} />
              <span>{isRefreshing ? "Syncing..." : lastRefreshed ? `Refresh (${lastRefreshed})` : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <Button onClick={() => fetchTelemetry(true)} variant="danger" size="xs">Retry</Button>
          </div>
        )}

        {/* 4 TOP CORE HEALTH CARDS WITH STATUS INDICATORS */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
            <Skeleton className="h-32 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CARD 1: BACKEND STATUS */}
            <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
                  <Server size={20} />
                </div>
                <Badge variant={backend?.status === "Operational" ? "success" : "danger"}>
                  {backend?.status || "Unknown"}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Backend Framework</span>
                <h2 className="text-base font-black text-slate-900 dark:text-white mt-0.5 truncate">
                  {backend?.framework || "Spring Boot"}
                </h2>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-1">
                  {backend?.javaVersion || "Java Runtime"}
                </span>
              </div>
            </div>

            {/* CARD 2: DATABASE STATUS */}
            <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                  <Database size={20} />
                </div>
                <Badge variant={isDbHealthy ? "success" : "danger"}>
                  {database?.status || "Disconnected"}
                </Badge>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Database Cluster</span>
                <h2 className="text-base font-black text-slate-900 dark:text-white mt-0.5 truncate" title={database?.version}>
                  {database?.version || "PostgreSQL"}
                </h2>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 mt-1">
                  <Zap size={12} /> {database?.latencyMs != null ? `${database.latencyMs}ms Query Latency` : "Latency N/A"}
                </span>
              </div>
            </div>

            {/* CARD 3: API STATUS */}
            <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <Globe size={20} />
                </div>
                <Badge variant="success">{api?.status || "Healthy"}</Badge>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">3. REST API</span>
                <h2 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {api?.responseTimeMs != null ? `${api.responseTimeMs} ms Response` : "Active"}
                </h2>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
                  <CheckCircle2 size={12} /> REST Endpoints Active
                </span>
              </div>
            </div>

            {/* CARD 4: SERVER UPTIME */}
            <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Clock size={20} />
                </div>
                <Badge variant="info">Uptime</Badge>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">4. Application Uptime</span>
                <h2 className="text-base font-black text-slate-900 dark:text-white mt-0.5 truncate">
                  {backend?.uptimeSeconds != null ? formatUptime(backend.uptimeSeconds) : "N/A"}
                </h2>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 block truncate">
                  {backend?.startedAt ? `Started: ${new Date(backend.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Online"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PROGRESS BARS SECTION (STORAGE, MEMORY, CPU USAGE) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
            <Skeleton className="h-44 rounded-3xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PROGRESS BAR 1: STORAGE USAGE */}
            <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
                    <HardDrive size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Application Storage</h3>
                    <span className="text-[10px] text-slate-400">Local Disk Filesystem</span>
                  </div>
                </div>
                <Badge variant="primary">{storage?.percentage != null ? `${storage.percentage}% Used` : "N/A"}</Badge>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-slate-100 dark:bg-[#0F172A] rounded-full h-3 overflow-hidden border border-slate-200 dark:border-[#334155]">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, storage?.percentage || 0)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>{storage?.usedGb != null ? `${storage.usedGb} GB Used` : "N/A"}</span>
                  <span>{storage?.totalGb != null ? `${storage.totalGb} GB Total` : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* PROGRESS BAR 2: MEMORY USAGE */}
            <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">JVM Memory Usage</h3>
                    <span className="text-[10px] text-slate-400">Heap Memory Allocation</span>
                  </div>
                </div>
                <Badge variant="info">{memory?.percentage != null ? `${memory.percentage}% Used` : "N/A"}</Badge>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-slate-100 dark:bg-[#0F172A] rounded-full h-3 overflow-hidden border border-slate-200 dark:border-[#334155]">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, memory?.percentage || 0)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>{memory?.usedGb != null ? `${memory.usedGb} GB Allocated` : "N/A"}</span>
                  <span>{memory?.totalGb != null ? `${memory.totalGb} GB Heap Total` : "N/A"}</span>
                </div>
              </div>
            </div>

            {/* PROGRESS BAR 3: CPU USAGE */}
            <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <Cpu size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">CPU Usage</h3>
                    <span className="text-[10px] text-slate-400">{cpu?.availableProcessors || 8} Available Cores</span>
                  </div>
                </div>
                <Badge variant="success">{cpu?.percentage != null ? `${cpu.percentage}% Load` : "0% Load"}</Badge>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-slate-100 dark:bg-[#0F172A] rounded-full h-3 overflow-hidden border border-slate-200 dark:border-[#334155]">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, cpu?.percentage || 0)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>{cpu?.percentage != null ? `${cpu.percentage}% Current Load` : "0% Load"}</span>
                  <span>{cpu?.availableProcessors != null ? `${cpu.availableProcessors} Processors` : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APPLICATION VERSION & METADATA DETAILS CARD */}
        <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Code size={18} className="text-blue-500" /> Application Version & Environment Telemetry
            </h2>
            <Badge variant="primary">{application?.version || "0.0.1-SNAPSHOT"}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Frontend Stack</span>
              <strong className="text-slate-900 dark:text-white mt-1 block">React 19 + Vite 8</strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Backend Framework</span>
              <strong className="text-slate-900 dark:text-white mt-1 block truncate" title={backend?.framework}>
                {backend?.framework || "Spring Boot"}
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Database Engine</span>
              <strong className="text-slate-900 dark:text-white mt-1 block truncate" title={database?.version}>
                {database?.databaseType || "PostgreSQL"}
              </strong>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Application Services</span>
              <strong className="text-emerald-600 dark:text-emerald-400 mt-1 block">
                {backend?.status || "Operational"}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default SystemMonitoring;
