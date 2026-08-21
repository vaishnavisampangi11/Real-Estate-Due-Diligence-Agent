import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Search,
  Home,
  Filter,
  ArrowUpDown,
  Eye,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  RefreshCw,
  ExternalLink,
  FileText,
  DollarSign,
  FileDown,
  Layers,
  MapPin,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  getMyProperties,
  getPropertyDocuments,
} from "../services/propertyService";
import { getReportsByProperty } from "../services/reportService";
import { getRiskAssessmentsByProperty } from "../services/riskService";

function AgentRequests() {
  const navigate = useNavigate();

  // State Management
  const [workflowItems, setWorkflowItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("VAL_DESC");

  // Fetch real agent properties and related DD records from PostgreSQL
  const fetchDueDiligenceWork = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Fetch properties managed by authenticated Agent
      const res = await getMyProperties(0, 50);
      const dataPayload = res?.data || res;
      const propsList = dataPayload?.content || (Array.isArray(dataPayload) ? dataPayload : []);

      if (propsList.length === 0) {
        setWorkflowItems([]);
        setLastSyncTime(new Date());
        return;
      }

      // 2. For each real property, retrieve genuine DD reports, risk assessments, and documents
      const items = await Promise.all(
        propsList.map(async (p) => {
          const pId = p.propertyId || p.id;
          let reports = [];
          let riskAssessments = [];
          let documents = [];

          try {
            const repRes = await getReportsByProperty(pId);
            reports = Array.isArray(repRes.data) ? repRes.data : Array.isArray(repRes) ? repRes : [];
          } catch (e) {}

          try {
            const riskRes = await getRiskAssessmentsByProperty(pId);
            riskAssessments = Array.isArray(riskRes.data) ? riskRes.data : Array.isArray(riskRes) ? riskRes : [];
          } catch (e) {}

          try {
            const docRes = await getPropertyDocuments(pId);
            documents = Array.isArray(docRes.data) ? docRes.data : Array.isArray(docRes) ? docRes : [];
          } catch (e) {}

          const latestRisk = riskAssessments.length > 0 ? riskAssessments[0] : null;
          const latestReport = reports.length > 0 ? reports[0] : null;

          const pCity = p.city || (typeof p.address === "object" ? p.address?.city : "") || "Hyderabad";
          const pState = p.state || (typeof p.address === "object" ? p.address?.state : "") || "Telangana";
          const pAddr =
            typeof p.address === "string"
              ? p.address
              : p.address?.addressLine1 || `${pCity}, ${pState}`;

          return {
            propertyId: pId,
            propertyCode: p.propertyCode || `PROP-PARCEL-${pId}`,
            propertyName: p.propertyName || `Property Parcel #${pId}`,
            propertyType: p.propertyType || "COMMERCIAL",
            marketValue: p.marketValue || 0,
            city: pCity,
            state: pState,
            address: pAddr,
            propertyStatus: p.status || "ACTIVE",
            reportsCount: reports.length,
            latestReport,
            riskAssessmentsCount: riskAssessments.length,
            latestRisk,
            documentsCount: documents.length,
          };
        })
      );

      setWorkflowItems(items);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Failed to load due diligence work:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Unable to load due diligence data from backend server.";
      setError(msg);
      setWorkflowItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueDiligenceWork();
  }, []);

  // Computed Real Summary Metrics
  const metrics = useMemo(() => {
    const totalProps = workflowItems.length;
    const totalReports = workflowItems.reduce((acc, curr) => acc + curr.reportsCount, 0);
    const totalAssessed = workflowItems.filter((i) => i.riskAssessmentsCount > 0).length;
    const totalDocs = workflowItems.reduce((acc, curr) => acc + curr.documentsCount, 0);

    return { totalProps, totalReports, totalAssessed, totalDocs };
  }, [workflowItems]);

  // Filter Logic
  const filteredItems = useMemo(() => {
    return workflowItems.filter((item) => {
      let matchStatus = true;
      if (statusFilter === "HAS_REPORT") {
        matchStatus = item.reportsCount > 0;
      } else if (statusFilter === "NO_REPORT") {
        matchStatus = item.reportsCount === 0;
      } else if (statusFilter === "ASSESSED") {
        matchStatus = item.riskAssessmentsCount > 0;
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.propertyName.toLowerCase().includes(q) ||
        item.propertyCode.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q) ||
        item.propertyType.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [workflowItems, statusFilter, searchQuery]);

  // Sort Logic
  const sortedItems = useMemo(() => {
    const list = [...filteredItems];
    if (sortBy === "VAL_DESC") {
      list.sort((a, b) => Number(b.marketValue) - Number(a.marketValue));
    } else if (sortBy === "VAL_ASC") {
      list.sort((a, b) => Number(a.marketValue) - Number(b.marketValue));
    } else if (sortBy === "REPORTS_DESC") {
      list.sort((a, b) => b.reportsCount - a.reportsCount);
    } else if (sortBy === "NAME_ASC") {
      list.sort((a, b) => a.propertyName.localeCompare(b.propertyName));
    }
    return list;
  }, [filteredItems, sortBy]);

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
              Due Diligence Work
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
              onClick={fetchDueDiligenceWork}
              loading={loading}
              icon={RefreshCw}
            >
              Sync
            </Button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <div>
                <p className="font-bold">Unable to load due diligence data</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
              </div>
            </div>
            <Button variant="danger" size="xs" onClick={fetchDueDiligenceWork}>
              Retry
            </Button>
          </div>
        )}

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              <ClipboardList size={13} /> Active Audit & Verification Pipeline
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              📋 Due Diligence Work
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] max-w-2xl">
              Review and track due diligence audit activity for properties managed by your account.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate("/agent/properties")}
              variant="outline"
              size="sm"
              icon={Building2}
            >
              My Properties
            </Button>
          </div>
        </div>

        {/* SUMMARY METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Managed Parcels</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? "..." : metrics.totalProps}
              </strong>
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
                <Building2 size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">DD Reports Generated</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {loading ? "..." : metrics.totalReports}
              </strong>
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Risk Assessed</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {loading ? "..." : `${metrics.totalAssessed} Parcels`}
              </strong>
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <ShieldCheck size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Supporting Documents</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {loading ? "..." : metrics.totalDocs}
              </strong>
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <FileText size={18} />
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
              placeholder="Search due diligence work by property name, code, city, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <Filter size={12} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Workflows</option>
                <option value="HAS_REPORT">Has DD Report</option>
                <option value="NO_REPORT">Pending DD Report</option>
                <option value="ASSESSED">Risk Assessed</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <ArrowUpDown size={12} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="VAL_DESC">Valuation: High to Low</option>
                <option value="VAL_ASC">Valuation: Low to High</option>
                <option value="REPORTS_DESC">Most DD Reports</option>
                <option value="NAME_ASC">Property Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-3xl" />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && workflowItems.length === 0 && (
          <div className="py-12">
            <EmptyState
              title="No Due Diligence Activity"
              message="Your managed properties do not currently have any due diligence records."
              actionLabel="Explore Property Catalog"
              onAction={() => navigate("/property-search")}
            />
          </div>
        )}

        {/* SEARCH EMPTY STATE */}
        {!loading && !error && workflowItems.length > 0 && sortedItems.length === 0 && (
          <div className="py-8">
            <EmptyState
              title="No matching due diligence records"
              message={`No properties matched "${searchQuery}".`}
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
            />
          </div>
        )}

        {/* WORKFLOW ITEMS LIST */}
        {!loading && !error && sortedItems.length > 0 && (
          <div className="space-y-4">
            {sortedItems.map((item) => {
              const valCr = (Number(item.marketValue || 0) / 10000000).toFixed(2);
              const hasReport = item.reportsCount > 0;
              const hasRisk = item.riskAssessmentsCount > 0;
              const riskScore = item.latestRisk?.overallScore ?? item.latestRisk?.riskScore;

              return (
                <div
                  key={item.propertyId}
                  className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:border-blue-400 dark:hover:border-cyan-500 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Property Info */}
                  <div className="space-y-2 lg:max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] text-blue-600 dark:text-cyan-400">
                        {item.propertyCode}
                      </span>
                      <Badge variant={item.propertyStatus === "ACTIVE" ? "success" : "warning"}>
                        {item.propertyStatus}
                      </Badge>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        {item.propertyType.replace(/_/g, " ")}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {item.propertyName}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span>{item.address}</span>
                      </p>
                    </div>
                  </div>

                  {/* Audit Metrics Breakdown */}
                  <div className="grid grid-cols-3 gap-3 text-xs font-mono p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/60 dark:border-[#334155] shrink-0">
                    {/* Valuation */}
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Market Value</span>
                      <strong className="text-blue-600 dark:text-cyan-400 font-extrabold text-xs block mt-0.5">
                        ₹ {valCr} Cr
                      </strong>
                    </div>

                    {/* DD Report Status */}
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">DD Dossier</span>
                      {hasReport ? (
                        <span className="text-emerald-600 font-bold text-xs block mt-0.5">
                          {item.reportsCount} Generated
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px] block mt-0.5">Pending</span>
                      )}
                    </div>

                    {/* Risk Score */}
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Risk Matrix</span>
                      {hasRisk && riskScore !== undefined && riskScore !== null ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs block mt-0.5">
                          {riskScore}/100 Score
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px] block mt-0.5">Not Assessed</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      onClick={() => navigate(`/property-details?id=${item.propertyId}`)}
                      variant="outline"
                      size="xs"
                      icon={Eye}
                    >
                      Details
                    </Button>

                    <Button
                      onClick={() => navigate(`/due-diligence-report?id=${item.propertyId}`)}
                      variant="primary"
                      size="xs"
                      icon={ShieldCheck}
                    >
                      Due Diligence
                    </Button>

                    <Button
                      onClick={() => navigate(`/property-valuation?id=${item.propertyId}`)}
                      variant="secondary"
                      size="xs"
                      icon={DollarSign}
                    >
                      Valuation
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default AgentRequests;
