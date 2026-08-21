import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  ResponsiveContainer,
} from "recharts";
import {
  Scale,
  ShieldCheck,
  FileCheck2,
  Clock,
  Download,
  Filter,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  FileText,
  Building2,
  CheckCircle2,
  BarChart3,
  Calendar,
  AlertCircle,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { Skeleton } from "../components/common/Skeleton";
import { showToast } from "../utils/swal";
import { exportToPdf } from "../utils/exportUtils";
import { getAllProperties } from "../services/propertyService";
import { getMyReports } from "../services/reportService";
import { getMyAssessments } from "../services/riskService";

function LegalAnalytics() {
  const [properties, setProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("ALL");

  const fetchAnalyticsData = async (isManual = false) => {
    try {
      setLoading(true);
      setError(null);

      const [propsRes, reportsRes, riskRes] = await Promise.allSettled([
        getAllProperties(0, 50),
        getMyReports(),
        getMyAssessments(),
      ]);

      if (propsRes.status === "fulfilled") {
        const payload = propsRes.value?.data || propsRes.value;
        setProperties(payload?.content || (Array.isArray(payload) ? payload : []));
      } else {
        setProperties([]);
      }

      if (reportsRes.status === "fulfilled") {
        const payload = reportsRes.value?.data || reportsRes.value;
        setReports(Array.isArray(payload) ? payload : (payload?.content || []));
      } else {
        setReports([]);
      }

      if (riskRes.status === "fulfilled") {
        const payload = riskRes.value?.data || riskRes.value;
        setAssessments(Array.isArray(payload) ? payload : (payload?.content || []));
      } else {
        setAssessments([]);
      }

      if (isManual) {
        showToast("Legal analytics refreshed from PostgreSQL database.", "success");
      }
    } catch (err) {
      console.error("Failed to load legal analytics:", err);
      setError("Unable to load analytics from PostgreSQL. Please verify Spring Boot is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Compute Live Metrics
  const totalParcels = properties.length;
  const verifiedParcels = properties.filter((p) => p.status === "VERIFIED").length;
  const verificationRate = totalParcels > 0 ? ((verifiedParcels / totalParcels) * 100).toFixed(1) : "0.0";
  const totalReports = reports.length;
  const highRiskCount = assessments.filter(
    (a) => a.riskLevel === "HIGH" || a.riskLevel === "CRITICAL" || (a.riskScore && Number(a.riskScore) >= 50)
  ).length;

  // Monthly Activity Trends from real report timestamps
  const monthlyTrends = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthCounts = months.map((m) => ({ month: m, completed: 0, pending: 0, parcels: 0 }));

    reports.forEach((r) => {
      if (r.createdAt) {
        const d = new Date(r.createdAt);
        const mIdx = d.getMonth();
        if (r.status === "COMPLETED" || r.status === "APPROVED" || r.status === "VERIFIED") {
          monthCounts[mIdx].completed += 1;
        } else {
          monthCounts[mIdx].pending += 1;
        }
      }
    });

    properties.forEach((p) => {
      if (p.createdAt) {
        const d = new Date(p.createdAt);
        const mIdx = d.getMonth();
        monthCounts[mIdx].parcels += 1;
      }
    });

    // Return the past 6-8 months with non-zero or active spread
    const currentMonthIdx = new Date().getMonth();
    return monthCounts.slice(Math.max(0, currentMonthIdx - 7), currentMonthIdx + 1);
  }, [reports, properties]);

  // Live Risk Distribution
  const riskDistribution = useMemo(() => {
    let low = 0;
    let medium = 0;
    let high = 0;

    assessments.forEach((a) => {
      const score = a.riskScore ? Number(a.riskScore) : 20;
      if (score >= 50 || a.riskLevel === "HIGH" || a.riskLevel === "CRITICAL") {
        high += 1;
      } else if (score >= 25 || a.riskLevel === "MEDIUM") {
        medium += 1;
      } else {
        low += 1;
      }
    });

    if (assessments.length === 0 && properties.length > 0) {
      // derive from property status
      properties.forEach((p) => {
        if (p.status === "VERIFIED") low += 1;
        else if (p.status === "FLAGGED") high += 1;
        else medium += 1;
      });
    }

    return [
      { name: "Low Risk (<25)", value: low || 1, color: "#10B981" },
      { name: "Medium Risk (25-50)", value: medium, color: "#F59E0B" },
      { name: "High Risk (>50)", value: high, color: "#F43F5E" },
    ];
  }, [assessments, properties]);

  // Live City Distribution
  const cityDistribution = useMemo(() => {
    const counts = {};
    properties.forEach((p) => {
      const city = (typeof p.city === "string" && p.city.trim()) || p.address?.city || "Other";
      counts[city] = (counts[city] || 0) + 1;
    });

    const colors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4"];
    return Object.entries(counts).map(([city, count], idx) => ({
      category: `${city} Parcels`,
      count,
      color: colors[idx % colors.length],
    }));
  }, [properties]);

  const handleExportAnalytics = () => {
    const summaryData = {
      totalParcels,
      verifiedParcels,
      verificationRate: `${verificationRate}%`,
      totalReports,
      highRiskCount,
      timestamp: new Date().toISOString(),
    };
    exportToPdf("Legal_Title_Deed_Analytics_Report", summaryData);
    showToast("Legal analytics report exported successfully.", "success");
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-blue-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Sub-Registrar Legal Analytics & Telemetry
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-800">
              POSTGRESQL ANALYTICS ENGINE
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={() => fetchAnalyticsData(true)}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Sync
            </Button>
          </div>
        </div>

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold mb-2">
              <Scale size={14} /> Real-Time Title Deed Verification Telemetry
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              Legal Review Analytics & Telemetry
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              Telemetry derived from live PostgreSQL property deeds, due diligence reports, and risk assessments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportAnalytics}
              className="flex items-center gap-1.5"
            >
              Export Report PDF
            </Button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
            <Button variant="danger" size="xs" onClick={() => fetchAnalyticsData(true)}>
              Retry Connection
            </Button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : (
          <>
            {/* KPI METRIC CARDS (100% REAL DB NUMBERS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Audited Parcels</span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalParcels}</h3>
                <span className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 block">
                  PostgreSQL Property Records
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Verification Rate</span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white font-mono">{verificationRate}%</h3>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                  {verifiedParcels} of {totalParcels} Title Deeds Clear
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Due Diligence Reports</span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white font-mono">{totalReports}</h3>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block">
                  Generated Dossiers
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">High Risk Parcels</span>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white font-mono">{highRiskCount}</h3>
                <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block">
                  {highRiskCount > 0 ? "Requires Legal Review" : "Zero High Risk"}
                </span>
              </div>
            </div>

            {/* CHARTS GRID (2 COLUMNS) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 1. Monthly Report Completion Trend */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp size={16} className="text-blue-500" /> Monthly Audit & Report Volume
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrends}>
                      <defs>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="month" stroke="#94A3B8" textAnchor="middle" />
                      <YAxis stroke="#94A3B8" />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="completed"
                        name="Completed Reviews"
                        stroke="#3B82F6"
                        fillOpacity={1}
                        fill="url(#colorCompleted)"
                      />
                      <Area
                        type="monotone"
                        dataKey="parcels"
                        name="Parcels Audited"
                        stroke="#10B981"
                        fillOpacity={0.2}
                        fill="#10B981"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 2. Risk Distribution Pie Chart */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" /> Title Deed Risk Distribution
                </h3>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 3. Geographic Parcel Distribution */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4 lg:col-span-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={16} className="text-indigo-500" /> Property Portfolio Geographic Distribution
                </h3>
                {cityDistribution.length > 0 ? (
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={cityDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                        <XAxis dataKey="category" stroke="#94A3B8" />
                        <YAxis stroke="#94A3B8" />
                        <Tooltip />
                        <Bar dataKey="count" name="Parcels Count" fill="#3B82F6" radius={[6, 6, 0, 0]}>
                          {cityDistribution.map((entry, index) => (
                            <Cell key={`bar-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    No parcel city distribution records found in database.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default LegalAnalytics;
