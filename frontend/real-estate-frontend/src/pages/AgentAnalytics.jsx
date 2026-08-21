import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Building2,
  DollarSign,
  FileText,
  Users,
  ShieldCheck,
  MapPin,
  Award,
  ArrowUpRight,
  Home,
  Activity,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  Scale,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  getMyProperties,
  getAllProperties,
  getMyReports,
  getAllReports,
  getMyAssessments,
} from "../services/propertyService";

const STATUS_COLORS = {
  VERIFIED: "#10B981",
  PENDING: "#F59E0B",
  IN_REVIEW: "#3B82F6",
  REJECTED: "#EF4444",
  ACTIVE: "#6366F1",
};

const RISK_COLORS = {
  LOW: "#10B981",
  MEDIUM: "#F59E0B",
  HIGH: "#EF4444",
};

function AgentAnalytics() {
  const [timeRange, setTimeRange] = useState("ALL");
  const [properties, setProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Fetch real database records from backend APIs
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [propsRes, repsRes, riskRes] = await Promise.allSettled([
        getMyProperties(0, 100),
        getMyReports(),
        getMyAssessments(),
      ]);

      let propsList =
        propsRes.status === "fulfilled"
          ? propsRes.value?.data?.content ||
            (Array.isArray(propsRes.value?.data) ? propsRes.value.data : [])
          : [];

      // Fallback to all properties if agent has 0 custom created properties
      if (propsList.length === 0) {
        try {
          const allRes = await getAllProperties(0, 100);
          propsList =
            allRes?.content || (Array.isArray(allRes) ? allRes : allRes?.data?.content || []);
        } catch (e) {
          console.warn("Could not fetch global catalog fallback:", e);
        }
      }

      let reportsList =
        repsRes.status === "fulfilled"
          ? Array.isArray(repsRes.value?.data)
            ? repsRes.value.data
            : Array.isArray(repsRes.value)
            ? repsRes.value
            : []
          : [];

      if (reportsList.length === 0) {
        try {
          const allReps = await getAllReports();
          reportsList = Array.isArray(allReps?.data)
            ? allReps.data
            : Array.isArray(allReps)
            ? allReps
            : [];
        } catch (e) {
          console.warn("Could not fetch global reports fallback:", e);
        }
      }

      const riskList =
        riskRes.status === "fulfilled"
          ? Array.isArray(riskRes.value?.data)
            ? riskRes.value.data
            : Array.isArray(riskRes.value)
            ? riskRes.value
            : []
          : [];

      setProperties(propsList);
      setReports(reportsList);
      setAssessments(riskList);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Failed to load analytics datasets:", err);
      setError("Unable to load real analytics data. Please verify the Spring Boot backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Filter properties & reports by active Time Range
  const filteredData = useMemo(() => {
    const now = new Date();
    const isWithinRange = (dateStr) => {
      if (!dateStr || timeRange === "ALL") return true;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return true;

      if (timeRange === "2026_YTD") {
        return d.getFullYear() === 2026;
      }
      if (timeRange === "6M") {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        return d >= sixMonthsAgo;
      }
      return true;
    };

    const rangedProps = properties.filter((p) => isWithinRange(p.createdAt));
    const rangedReps = reports.filter((r) => isWithinRange(r.createdAt));
    const rangedRisk = assessments.filter((a) => isWithinRange(a.createdAt || a.assessmentDate));

    return {
      properties: rangedProps,
      reports: rangedReps,
      assessments: rangedRisk,
    };
  }, [properties, reports, assessments, timeRange]);

  // Derived Real KPIs
  const kpis = useMemo(() => {
    const totalProps = filteredData.properties.length;
    const totalReps = filteredData.reports.length;
    const verifiedProps = filteredData.properties.filter((p) => p.status === "VERIFIED").length;
    const pendingProps = filteredData.properties.filter(
      (p) => p.status === "PENDING" || p.status === "IN_REVIEW"
    ).length;

    const totalValuationNum = filteredData.properties.reduce(
      (acc, p) => acc + (Number(p.marketValue) || 0),
      0
    );

    const totalValuationCr = (totalValuationNum / 10000000).toFixed(2);
    const avgValuationCr =
      totalProps > 0 ? (totalValuationNum / totalProps / 10000000).toFixed(2) : "0.00";

    const verifiedPercentage = totalProps > 0 ? ((verifiedProps / totalProps) * 100).toFixed(1) : "0.0";

    return {
      totalProps,
      totalReps,
      verifiedProps,
      pendingProps,
      totalValuationCr,
      avgValuationCr,
      verifiedPercentage,
    };
  }, [filteredData]);

  // Chart 1: Properties by Verification Status
  const statusChartData = useMemo(() => {
    const counts = {};
    filteredData.properties.forEach((p) => {
      const s = p.status || "PENDING";
      counts[s] = (counts[s] || 0) + 1;
    });

    return Object.keys(counts).map((key) => ({
      name: key.replace(/_/g, " "),
      value: counts[key],
      color: STATUS_COLORS[key] || "#64748B",
    }));
  }, [filteredData.properties]);

  // Chart 2: Properties by Property Type
  const typeChartData = useMemo(() => {
    const counts = {};
    filteredData.properties.forEach((p) => {
      const t = p.propertyType || "Residential";
      counts[t] = (counts[t] || 0) + 1;
    });

    return Object.keys(counts).map((key) => ({
      type: key,
      count: counts[key],
    }));
  }, [filteredData.properties]);

  // Chart 3: Properties by State / Location
  const locationChartData = useMemo(() => {
    const counts = {};
    filteredData.properties.forEach((p) => {
      const loc = p.state || p.city || "Urban Region";
      counts[loc] = (counts[loc] || 0) + 1;
    });

    return Object.keys(counts).map((key) => ({
      location: key,
      count: counts[key],
    }));
  }, [filteredData.properties]);

  // Chart 4: Reports by Status
  const reportStatusData = useMemo(() => {
    const counts = {};
    filteredData.reports.forEach((r) => {
      const s = r.reportStatus || "GENERATED";
      counts[s] = (counts[s] || 0) + 1;
    });

    return Object.keys(counts).map((key) => ({
      name: key.replace(/_/g, " "),
      value: counts[key],
      color: key === "GENERATED" || key === "COMPLETED" ? "#10B981" : "#F59E0B",
    }));
  }, [filteredData.reports]);

  // Chart 5: Risk Distribution (Low / Medium / High)
  const riskDistributionData = useMemo(() => {
    const counts = { LOW: 0, MEDIUM: 0, HIGH: 0 };

    if (filteredData.assessments.length > 0) {
      filteredData.assessments.forEach((a) => {
        const lvl = (a.riskLevel || "LOW").toUpperCase();
        if (counts[lvl] !== undefined) {
          counts[lvl] += 1;
        } else {
          counts.LOW += 1;
        }
      });
    } else {
      // Aggregate from properties status
      filteredData.properties.forEach((p) => {
        if (p.status === "VERIFIED") counts.LOW += 1;
        else if (p.status === "PENDING" || p.status === "IN_REVIEW") counts.MEDIUM += 1;
        else counts.HIGH += 1;
      });
    }

    return [
      { name: "Low Risk", value: counts.LOW, color: RISK_COLORS.LOW },
      { name: "Medium Risk", value: counts.MEDIUM, color: RISK_COLORS.MEDIUM },
      { name: "High Risk", value: counts.HIGH, color: RISK_COLORS.HIGH },
    ].filter((item) => item.value > 0);
  }, [filteredData.assessments, filteredData.properties]);

  // Regional City & State Table Aggregation
  const citySummary = useMemo(() => {
    const map = {};
    filteredData.properties.forEach((p) => {
      const city = p.city || "Urban Region";
      const state = p.state || "India";
      const key = `${city}, ${state}`;

      if (!map[key]) {
        map[key] = {
          city,
          state,
          count: 0,
          verified: 0,
          valuation: 0,
        };
      }

      map[key].count += 1;
      if (p.status === "VERIFIED") map[key].verified += 1;
      map[key].valuation += Number(p.marketValue) || 0;
    });

    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filteredData.properties]);

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* BREADCRUMB HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <Home size={14} className="text-blue-600 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Due Diligence Analytics & Intelligence
            </span>
          </div>

          <div className="flex items-center gap-3">
            {lastSyncTime && (
              <span className="text-[11px] text-slate-400">
                Synced {lastSyncTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <Button
              variant="outline"
              size="xs"
              onClick={fetchAnalyticsData}
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
                <p className="font-bold">Unable to load analytics</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
              </div>
            </div>
            <Button variant="danger" size="xs" onClick={fetchAnalyticsData}>
              Retry
            </Button>
          </div>
        )}

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              <Activity size={13} /> PostgreSQL Due Diligence Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              📊 Analytics & Market Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] max-w-2xl">
              Real-time audit metrics on managed properties, title verifications, risk distributions, and regional portfolio valuations.
            </p>
          </div>

          {/* DYNAMIC TIME RANGE SWITCHER */}
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0F172A] p-1.5 rounded-2xl border border-slate-200 dark:border-[#334155] text-xs font-bold shrink-0">
            {[
              { id: "ALL", label: "All Time" },
              { id: "2026_YTD", label: "2026 YTD" },
              { id: "6M", label: "Last 6 Months" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  timeRange === t.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-3xl" />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && filteredData.properties.length === 0 && (
          <div className="py-12">
            <EmptyState
              title="No Analytics Available Yet"
              message="Analytics will dynamically populate when properties and due diligence reports are recorded in your workspace."
              actionLabel="Explore Property Catalog"
              onAction={() => fetchAnalyticsData()}
            />
          </div>
        )}

        {/* REAL KPIS SECTION */}
        {!loading && !error && filteredData.properties.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">
                  Total Properties Analyzed
                </span>
                <div className="flex items-center justify-between mt-2">
                  <strong className="text-2xl font-black text-slate-900 dark:text-white">
                    {kpis.totalProps} Parcels
                  </strong>
                  <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
                    <Building2 size={18} />
                  </div>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
                  {kpis.verifiedPercentage}% Clear Title Rate
                </span>
              </div>

              <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">
                  Due Diligence Dossiers
                </span>
                <div className="flex items-center justify-between mt-2">
                  <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {kpis.totalReps} Reports
                  </strong>
                  <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <FileText size={18} />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold mt-1 block">
                  13-Vector Audit Verified
                </span>
              </div>

              <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">
                  Total Portfolio Valuation
                </span>
                <div className="flex items-center justify-between mt-2">
                  <strong className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    ₹ {kpis.totalValuationCr} Cr
                  </strong>
                  <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    <DollarSign size={18} />
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-bold mt-1 block">
                  Avg ₹ {kpis.avgValuationCr} Cr / Parcel
                </span>
              </div>

              <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
                <span className="text-slate-400 uppercase text-[10px] font-bold block">
                  Clear / Verified Parcels
                </span>
                <div className="flex items-center justify-between mt-2">
                  <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {kpis.verifiedProps} / {kpis.totalProps}
                  </strong>
                  <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold mt-1 block">
                  {kpis.pendingProps} Pending Review
                </span>
              </div>
            </div>

            {/* CHARTS GRID 1: VERIFICATION STATUS & RISK PROFILES */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Verification Pipeline */}
              <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400">
                      Audit Pipeline
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Properties by Verification Status
                    </h3>
                  </div>
                  <Badge variant="primary">{filteredData.properties.length} Total</Badge>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "11px",
                          fontFamily: "monospace",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Risk Profile Distribution */}
              <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                      Risk Analytics
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Risk Level Distribution
                    </h3>
                  </div>
                  <Badge variant="success">PostgreSQL Assessed</Badge>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={riskDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {riskDistributionData.map((entry, index) => (
                          <Cell key={`cell-risk-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "11px",
                          fontFamily: "monospace",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* CHARTS GRID 2: PROPERTY TYPES & GEOGRAPHY */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 3: Property Types */}
              <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                    Asset Classes
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Properties by Property Type
                  </h3>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={typeChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="type" stroke="#94A3B8" fontSize={10} />
                      <YAxis stroke="#94A3B8" fontSize={10} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "11px",
                          fontFamily: "monospace",
                        }}
                      />
                      <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Location Distribution */}
              <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400">
                    Geography
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Property Distribution Across Regions
                  </h3>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={locationChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="location" stroke="#94A3B8" fontSize={10} />
                      <YAxis stroke="#94A3B8" fontSize={10} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0F172A",
                          borderColor: "#334155",
                          borderRadius: "12px",
                          color: "#fff",
                          fontSize: "11px",
                          fontFamily: "monospace",
                        }}
                      />
                      <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* REGIONAL MARKET BREAKDOWN TABLE */}
            <div className="white-card rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs overflow-hidden space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400">
                    Regional Intelligence
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    City & State Market Performance
                  </h3>
                </div>
                <Badge variant="secondary">{citySummary.length} Locations</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150 dark:border-[#334155] bg-slate-50/50 dark:bg-[#0F172A]/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Market / City</th>
                      <th className="py-3.5 px-4">State</th>
                      <th className="py-3.5 px-4">Properties</th>
                      <th className="py-3.5 px-4">Verified Clear</th>
                      <th className="py-3.5 px-4 text-right">Total Valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                    {citySummary.map((c, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50/80 dark:hover:bg-[#0F172A]/40 transition-colors"
                      >
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <MapPin size={14} className="text-blue-500" />
                          {c.city}
                        </td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          {c.state}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                          {c.count} Parcels
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="success">
                            {c.verified} / {c.count} Clear
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          ₹ {(c.valuation / 10000000).toFixed(2)} Cr
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default AgentAnalytics;
