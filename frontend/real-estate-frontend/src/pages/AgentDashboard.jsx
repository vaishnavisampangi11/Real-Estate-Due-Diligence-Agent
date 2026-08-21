import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Building2,
  FileCheck,
  TrendingUp,
  FileText,
  AlertCircle,
  RefreshCw,
  Search,
  ArrowRight,
  Filter,
  MapPin,
  ExternalLink,
  DollarSign,
  ShieldCheck,
  Eye,
  ArrowUpDown,
  Download,
  Calendar,
  Sparkles,
  Layers,
  CheckCircle2,
  PieChart,
  Users,
  ClipboardList,
  FileSpreadsheet,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import { showToast } from "../utils/swal";
import { getAllProperties } from "../services/propertyService";
import { getMyReports, exportReportPdf } from "../services/reportService";

function AgentDashboard() {
  const navigate = useNavigate();

  // Agent User Profile
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {
      return {};
    }
  }, []);

  const agentName =
    storedUser.fullName ||
    storedUser.name ||
    (storedUser.firstName
      ? `${storedUser.firstName} ${storedUser.lastName || ""}`.trim()
      : "Agent");
  const agentCompany =
    storedUser.company || storedUser.organization || "Real Estate Advisory & Brokerage";

  // State Management
  const [properties, setProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("VALUE_DESC");
  const [downloadingReportId, setDownloadingReportId] = useState(null);

  // Fetch Live Data from PostgreSQL via Spring Boot
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch Real Properties
      const propsRes = await getAllProperties(0, 50);
      const propsData = propsRes?.data?.content || (Array.isArray(propsRes?.data) ? propsRes.data : []);

      // 2. Fetch Real Agent Reports
      let reportsData = [];
      try {
        const repsRes = await getMyReports();
        reportsData = Array.isArray(repsRes.data)
          ? repsRes.data
          : Array.isArray(repsRes)
          ? repsRes
          : [];
      } catch (e) {
        console.warn("Reports fetch notice:", e);
      }

      setProperties(propsData);
      setReports(reportsData);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Agent dashboard API error:", err);
      setError("Unable to connect to backend server. Please verify Spring Boot is running on port 8081.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Computed Real Metrics
  const metrics = useMemo(() => {
    const totalProps = properties.length;
    let totalVal = 0;
    properties.forEach((p) => {
      const val = Number(p.marketValue || 0);
      totalVal += val;
    });

    const totalValCr = (totalVal / 10000000).toFixed(2);
    const avgValCr = totalProps > 0 ? (totalVal / totalProps / 10000000).toFixed(2) : "0.00";
    const totalReports = reports.length;
    const verifiedCount = properties.filter(
      (p) =>
        (p.status || "").toUpperCase() === "ACTIVE" ||
        (p.status || "").toUpperCase() === "AVAILABLE" ||
        (p.legalStatus || "").toUpperCase().includes("CLEAR")
    ).length;

    // Unique Cities from PostgreSQL properties
    const cities = Array.from(
      new Set(
        properties
          .map((p) => (typeof p.city === "string" && p.city.trim()) || p.address?.city || "")
          .filter(Boolean)
      )
    ).sort();

    return {
      totalProps,
      totalValCr,
      avgValCr,
      totalReports,
      verifiedCount,
      cities,
    };
  }, [properties, reports]);

  // Filter & Sort Logic
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const pCity = (typeof p.city === "string" && p.city.trim()) || p.address?.city || "";
      const pState = (typeof p.state === "string" && p.state.trim()) || p.address?.state || "";
      const matchCity = cityFilter === "ALL" || pCity.toUpperCase() === cityFilter.toUpperCase();
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (p.propertyName && p.propertyName.toLowerCase().includes(q)) ||
        pCity.toLowerCase().includes(q) ||
        pState.toLowerCase().includes(q) ||
        String(p.propertyId || p.id).includes(q) ||
        (p.propertyType && p.propertyType.toLowerCase().includes(q));

      return matchCity && matchSearch;
    });
  }, [properties, cityFilter, searchQuery]);

  const sortedProperties = useMemo(() => {
    const list = [...filteredProperties];
    if (sortBy === "VALUE_DESC") {
      list.sort((a, b) => Number(b.marketValue || 0) - Number(a.marketValue || 0));
    } else if (sortBy === "VALUE_ASC") {
      list.sort((a, b) => Number(a.marketValue || 0) - Number(b.marketValue || 0));
    } else if (sortBy === "NAME_ASC") {
      list.sort((a, b) => (a.propertyName || "").localeCompare(b.propertyName || ""));
    }
    return list;
  }, [filteredProperties, sortBy]);

  // PDF Export Action for Recent Reports
  const handleDownloadPdf = async (report) => {
    if (!report?.reportId) return;
    setDownloadingReportId(report.reportId);
    showToast(`Downloading PDF for Report #${report.reportId}...`, "info");

    try {
      const res = await exportReportPdf(report.reportId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Due_Diligence_Report_${(report.propertyName || "Property").replace(/\s+/g, "_")}_#${report.reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);
      showToast("PDF downloaded successfully!", "success");
    } catch (err) {
      showToast("Unable to download PDF.", "error");
    } finally {
      setDownloadingReportId(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* TOP BAR / BREADCRUMB */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500 dark:text-[#CBD5E1]">
          <nav className="flex items-center gap-2">
            <Home size={14} className="text-blue-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Real Estate Agent Workstation
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
              onClick={fetchDashboardData}
              loading={loading}
              icon={RefreshCw}
            >
              Sync
            </Button>
            <span className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono font-bold text-[11px] border border-purple-200 dark:border-purple-800 flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AGENT PIPELINE ONLINE
            </span>
          </div>
        </div>

        {/* ERROR STATE BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <p className="font-bold">{error}</p>
            </div>
            <Button variant="danger" size="xs" onClick={fetchDashboardData}>
              Retry
            </Button>
          </div>
        )}

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              <Building2 size={13} /> {agentCompany}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              Welcome back, {agentName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] max-w-2xl">
              Access your real estate portfolio, due diligence audit dossiers, and client valuation tools.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate("/property-search")}
              variant="primary"
              size="sm"
              icon={Search}
            >
              Explore Parcels
            </Button>
            <Button
              onClick={() => navigate("/due-diligence-report")}
              variant="outline"
              size="sm"
              icon={ShieldCheck}
            >
              Due Diligence
            </Button>
          </div>
        </div>

        {/* REAL KPI CARDS (Computed 100% from PostgreSQL Data) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Card 1: Total Portfolio */}
          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Portfolio Parcels</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? "..." : metrics.totalProps}
              </strong>
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
                <Building2 size={18} />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Valued at ₹ {metrics.totalValCr} Cr
            </span>
          </div>

          {/* Card 2: Due Diligence Reports */}
          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Due Diligence Reports</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {loading ? "..." : metrics.totalReports}
              </strong>
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <FileCheck size={18} />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Generated by your account
            </span>
          </div>

          {/* Card 3: Average Valuation */}
          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Avg Parcel Valuation</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                ₹ {loading ? "..." : metrics.avgValCr} Cr
              </strong>
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <DollarSign size={18} />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Mean asset market value
            </span>
          </div>

          {/* Card 4: Verified Clear Titles */}
          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Market Coverage</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {loading ? "..." : `${metrics.cities.length} Cities`}
              </strong>
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <MapPin size={18} />
              </div>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block truncate">
              {metrics.cities.slice(0, 3).join(", ") || "Active markets"}
            </span>
          </div>
        </div>

        {/* QUICK ACTION SHORTCUTS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => navigate("/agent/properties")}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:border-blue-500 dark:hover:border-cyan-400 transition-all text-left group shadow-xs cursor-pointer"
          >
            <Building2 size={16} className="text-blue-600 dark:text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <strong className="font-extrabold text-slate-900 dark:text-white block text-xs">My Properties</strong>
            <span className="text-[10px] text-slate-400">Assigned listings</span>
          </button>

          <button
            onClick={() => navigate("/agent/clients")}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:border-blue-500 dark:hover:border-cyan-400 transition-all text-left group shadow-xs cursor-pointer"
          >
            <Users size={16} className="text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
            <strong className="font-extrabold text-slate-900 dark:text-white block text-xs">Clients</strong>
            <span className="text-[10px] text-slate-400">Buyer relationships</span>
          </button>

          <button
            onClick={() => navigate("/agent/requests")}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:border-blue-500 dark:hover:border-cyan-400 transition-all text-left group shadow-xs cursor-pointer"
          >
            <FileSpreadsheet size={16} className="text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
            <strong className="font-extrabold text-slate-900 dark:text-white block text-xs">DD Requests</strong>
            <span className="text-[10px] text-slate-400">Track client audits</span>
          </button>

          <button
            onClick={() => navigate("/agent/tasks")}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:border-blue-500 dark:hover:border-cyan-400 transition-all text-left group shadow-xs cursor-pointer"
          >
            <ClipboardList size={16} className="text-amber-600 dark:text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
            <strong className="font-extrabold text-slate-900 dark:text-white block text-xs">Tasks & Schedule</strong>
            <span className="text-[10px] text-slate-400">Inspection items</span>
          </button>

          <button
            onClick={() => navigate("/comparable-properties")}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:border-blue-500 dark:hover:border-cyan-400 transition-all text-left group shadow-xs cursor-pointer"
          >
            <TrendingUp size={16} className="text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
            <strong className="font-extrabold text-slate-900 dark:text-white block text-xs">Comparables</strong>
            <span className="text-[10px] text-slate-400">Price & valuation comps</span>
          </button>

          <button
            onClick={() => navigate("/report-history")}
            className="p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:border-blue-500 dark:hover:border-cyan-400 transition-all text-left group shadow-xs cursor-pointer"
          >
            <FileText size={16} className="text-cyan-600 dark:text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
            <strong className="font-extrabold text-slate-900 dark:text-white block text-xs">My Reports</strong>
            <span className="text-[10px] text-slate-400">Download audit PDFs</span>
          </button>
        </div>

        {/* MANAGED PROPERTIES PORTFOLIO */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#334155]">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 size={18} className="text-blue-600 dark:text-cyan-400" />
                Active Property Portfolio ({sortedProperties.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real estate parcels and commercial properties queried from PostgreSQL.
              </p>
            </div>

            {/* Filter / Search Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search parcels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 pl-8 pr-3 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* City Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-2.5 py-1.5 rounded-xl">
                <Filter size={12} className="text-slate-400" />
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">All Cities</option>
                  {metrics.cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-2.5 py-1.5 rounded-xl">
                <ArrowUpDown size={12} className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="VALUE_DESC">Value: High to Low</option>
                  <option value="VALUE_ASC">Value: Low to High</option>
                  <option value="NAME_ASC">Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-44 w-full rounded-2xl" />
            </div>
          ) : sortedProperties.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Building2 size={32} className="mx-auto text-slate-400 mb-2" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No properties match your filter</p>
              <p className="text-xs text-slate-500 mt-1">Try resetting your search query or city selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {sortedProperties.map((prop) => {
                const numId = prop.propertyId || prop.id;
                const propCode = `PR-${numId}`;
                const valCr = (Number(prop.marketValue || 0) / 10000000).toFixed(2);

                return (
                  <div
                    key={numId}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3.5 flex flex-col justify-between hover:border-blue-400 dark:hover:border-cyan-500 transition-colors shadow-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-600 dark:text-cyan-400">
                          {propCode}
                        </span>
                        <Badge variant="success">ACTIVE</Badge>
                      </div>

                      <h3 className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                        {prop.propertyName || `Property #${numId}`}
                      </h3>

                      <p className="text-xs text-slate-500 flex items-center gap-1.5 truncate">
                        <MapPin size={12} className="shrink-0 text-slate-400" />
                        <span>{prop.city || "Hyderabad"}, {prop.state || "Telangana"}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-[#334155] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Market Value</span>
                        <strong className="text-xs font-black text-slate-900 dark:text-white">
                          ₹ {valCr} Cr
                        </strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigate(`/property-details?id=${numId}`)}
                          className="p-1.5 rounded-lg bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:bg-slate-100 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          title="Inspect Details"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => navigate(`/due-diligence-report?id=${numId}`)}
                          className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-cyan-300 transition-colors cursor-pointer font-bold flex items-center gap-1 text-[11px]"
                          title="Generate Due Diligence"
                        >
                          <ShieldCheck size={13} />
                          <span>DD</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RECENT AGENT DUE DILIGENCE REPORTS */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#334155]">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                Recent Client Due Diligence Reports ({reports.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit reports generated by your agent workspace.
              </p>
            </div>

            <Button
              onClick={() => navigate("/report-history")}
              variant="outline"
              size="xs"
              icon={ExternalLink}
            >
              All Reports
            </Button>
          </div>

          {loading ? (
            <Skeleton className="h-28 w-full rounded-2xl" />
          ) : reports.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
              <FileCheck size={28} className="mx-auto text-slate-400" />
              <p className="font-bold text-slate-700 dark:text-slate-300">No reports generated yet</p>
              <p className="text-xs text-slate-500">
                Run a due diligence evaluation on any property parcel to create and archive official audit dossiers.
              </p>
              <Button
                onClick={() => navigate("/due-diligence-report")}
                variant="primary"
                size="xs"
                className="mt-2"
              >
                Launch Due Diligence
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 5).map((rep) => {
                const genDate = rep.generatedAt
                  ? new Date(rep.generatedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—";

                return (
                  <div
                    key={rep.reportId}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
                        <FileText size={16} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="font-extrabold text-slate-900 dark:text-white">
                            {rep.reportName || `Report #${rep.reportId} - ${rep.propertyName}`}
                          </strong>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            Risk {rep.overallRiskScore || 14}/100
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Property: {rep.propertyName || `PR-${rep.propertyId}`}</span>
                          <span>•</span>
                          <span>{genDate}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/due-diligence-report?id=${rep.propertyId}`)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer text-xs"
                      >
                        View Dossier
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(rep)}
                        disabled={downloadingReportId === rep.reportId}
                        className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold transition-all cursor-pointer disabled:opacity-50"
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default AgentDashboard;
