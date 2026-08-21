import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  FileText,
  Search,
  Filter,
  Eye,
  FileDown,
  Trash2,
  Calendar,
  Building2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  X,
  Clock,
  RefreshCw,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight as ChevronRightIcon,
  User,
} from "lucide-react";
import { showToast, showConfirmDialog, showSuccessAlert } from "../utils/swal";
import {
  getMyReports,
  exportReportPdf,
  exportReportExcel,
  deleteReport,
} from "../services/reportService";
import { normalizeRole } from "../utils/roleUtils";

function ReportHistory() {
  const navigate = useNavigate();

  // User details
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (e) {
      return {};
    }
  }, []);

  const userRole = storedUser.role || "Buyer";
  const normalizedRole = normalizeRole(userRole);

  // Role-Aware Page Titles
  const rolePageHeaders = {
    buyer: {
      title: "My Reports",
      subtitle: "View, review, download and manage your due diligence reports and property evaluations.",
    },
    agent: {
      title: "Client & Property Reports",
      subtitle: "Access and manage due diligence reports compiled for your client property portfolio.",
    },
    legal: {
      title: "Legal Review Reports",
      subtitle: "Manage and verify institutional legal compliance and property due diligence reports.",
    },
    financial: {
      title: "Financial & Due Diligence Reports",
      subtitle: "Access institutional due diligence and collateral risk reports for loan underwriting.",
    },
    admin: {
      title: "Report Management",
      subtitle: "Comprehensive oversight of system-wide due diligence reports and audit dossiers.",
    },
  };

  const currentHeader = rolePageHeaders[normalizedRole] || rolePageHeaders.buyer;

  // Real Reports State
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DATE_DESC");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Action Loading States
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadingExcelId, setDownloadingExcelId] = useState(null);

  // Preview Modal State
  const [previewReport, setPreviewReport] = useState(null);

  // Fetch User-Scoped Reports from PostgreSQL via Spring Boot
  const fetchMyReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getMyReports();
      const raw = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];

      setReportsList(raw);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Failed to fetch user reports:", err);
      const msg = err.response?.data?.message || err.message || "Unable to load your reports.";
      setError(msg);
      setReportsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  // Summary Metrics (Strictly calculated from real API data)
  const summaryMetrics = useMemo(() => {
    const total = reportsList.length;
    const completed = reportsList.filter(
      (r) => (r.reportStatus || "").toUpperCase() === "GENERATED" || (r.reportStatus || "").toUpperCase() === "COMPLETED"
    ).length;
    const pending = reportsList.filter(
      (r) => (r.reportStatus || "").toUpperCase() === "PENDING" || (r.reportStatus || "").toUpperCase() === "DRAFT"
    ).length;
    const highRisk = reportsList.filter((r) => {
      const score = Number(r.overallRiskScore || 0);
      return score >= 60;
    }).length;

    return { total, completed, pending, highRisk };
  }, [reportsList]);

  // Filter & Search Logic
  const filteredReports = useMemo(() => {
    return reportsList.filter((item) => {
      const status = (item.reportStatus || "GENERATED").toUpperCase();
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "COMPLETED" && (status === "GENERATED" || status === "COMPLETED")) ||
        (statusFilter === "PENDING" && (status === "PENDING" || status === "DRAFT"));

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (item.reportName && item.reportName.toLowerCase().includes(q)) ||
        (item.propertyName && item.propertyName.toLowerCase().includes(q)) ||
        String(item.reportId).includes(q) ||
        String(item.propertyId).includes(q) ||
        (item.generatedByUserEmail && item.generatedByUserEmail.toLowerCase().includes(q));

      return matchStatus && matchSearch;
    });
  }, [reportsList, statusFilter, searchQuery]);

  // Sorting Logic
  const sortedReports = useMemo(() => {
    const list = [...filteredReports];
    if (sortBy === "DATE_DESC") {
      list.sort((a, b) => new Date(b.generatedAt || 0) - new Date(a.generatedAt || 0));
    } else if (sortBy === "DATE_ASC") {
      list.sort((a, b) => new Date(a.generatedAt || 0) - new Date(b.generatedAt || 0));
    } else if (sortBy === "RISK_ASC") {
      list.sort((a, b) => Number(a.overallRiskScore || 0) - Number(b.overallRiskScore || 0));
    } else if (sortBy === "RISK_DESC") {
      list.sort((a, b) => Number(b.overallRiskScore || 0) - Number(a.overallRiskScore || 0));
    } else if (sortBy === "NAME_ASC") {
      list.sort((a, b) => (a.propertyName || "").localeCompare(b.propertyName || ""));
    }
    return list;
  }, [filteredReports, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedReports.length / rowsPerPage) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedReports.slice(start, start + rowsPerPage);
  }, [sortedReports, currentPage, rowsPerPage]);

  // Actions
  const handleDownloadPdf = async (report) => {
    if (!report?.reportId) return;
    setDownloadingId(report.reportId);
    showToast(`Downloading PDF for Report #${report.reportId}...`, "info");

    try {
      const res = await exportReportPdf(report.reportId);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Due_Diligence_Report_${report.propertyName ? report.propertyName.replace(/\s+/g, "_") : `PR-${report.propertyId}`}_#${report.reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);

      showSuccessAlert(
        "PDF Downloaded",
        `Due Diligence Report #${report.reportId} for ${report.propertyName || `Property #${report.propertyId}`} downloaded successfully.`
      );
    } catch (err) {
      console.error("PDF download failed:", err);
      showToast("Unable to download PDF. Please try again.", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadExcel = async (report) => {
    if (!report?.reportId) return;
    setDownloadingExcelId(report.reportId);
    showToast(`Exporting Excel sheet for Report #${report.reportId}...`, "info");

    try {
      const res = await exportReportExcel(report.reportId);
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Due_Diligence_Report_${report.propertyName ? report.propertyName.replace(/\s+/g, "_") : `PR-${report.propertyId}`}_#${report.reportId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);

      showSuccessAlert(
        "Excel Downloaded",
        `Excel dossier for Report #${report.reportId} downloaded successfully.`
      );
    } catch (err) {
      console.error("Excel download failed:", err);
      showToast("Unable to export Excel for this report.", "error");
    } finally {
      setDownloadingExcelId(null);
    }
  };

  const handleDelete = async (report) => {
    const confirmed = await showConfirmDialog({
      title: `Delete Report #${report.reportId}?`,
      text: `Are you sure you want to delete the due diligence report for "${report.propertyName || `Property #${report.propertyId}`}"?`,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      icon: "warning",
    });

    if (confirmed) {
      try {
        await deleteReport(report.reportId);
        showToast(`Report #${report.reportId} deleted successfully.`, "success");
        setReportsList((prev) => prev.filter((r) => r.reportId !== report.reportId));
      } catch (err) {
        showToast("Unable to delete report.", "error");
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500 dark:text-[#CBD5E1]">
          <nav className="flex items-center gap-2">
            <Link
              to={
                normalizedRole === "agent"
                  ? "/agent/dashboard"
                  : normalizedRole === "legal"
                  ? "/legal/dashboard"
                  : normalizedRole === "financial"
                  ? "/financial/dashboard"
                  : normalizedRole === "admin"
                  ? "/admin/dashboard"
                  : "/buyer/dashboard"
              }
              className="hover:text-blue-600 dark:text-cyan-400 transition-colors"
            >
              {userRole} Workspace
            </Link>
            <ChevronRightIcon size={14} className="text-slate-400" />
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              {currentHeader.title}
            </span>
          </nav>

          {lastSyncTime && (
            <span className="text-slate-400 dark:text-slate-500 text-[11px] flex items-center gap-1.5">
              <Clock size={12} /> Last synchronized: {lastSyncTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              <FileText size={14} /> Due Diligence Report Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              📄 {currentHeader.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] max-w-2xl">
              {currentHeader.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={fetchMyReports}
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              onClick={() => navigate("/property-search")}
              variant="primary"
              size="sm"
              icon={Plus}
            >
              Explore Properties
            </Button>
          </div>
        </div>

        {/* SUMMARY METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Total Reports</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? "..." : summaryMetrics.total}
              </strong>
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
                <FileText size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Completed / Generated</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {loading ? "..." : summaryMetrics.completed}
              </strong>
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Pending / Draft</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {loading ? "..." : summaryMetrics.pending}
              </strong>
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Clock size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">High Risk Reports</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {loading ? "..." : summaryMetrics.highRisk}
              </strong>
              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <AlertTriangle size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="white-card rounded-3xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports or properties..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <Filter size={13} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Generated / Completed</option>
                <option value="PENDING">Pending / Draft</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="DATE_DESC">Date: Newest First</option>
                <option value="DATE_ASC">Date: Oldest First</option>
                <option value="RISK_ASC">Risk: Lowest First</option>
                <option value="RISK_DESC">Risk: Highest First</option>
                <option value="NAME_ASC">Property Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-3xl" />
            <Skeleton className="h-20 w-full rounded-3xl" />
            <Skeleton className="h-20 w-full rounded-3xl" />
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="max-w-xl mx-auto py-8 text-center space-y-4">
            <div className="glass-card rounded-3xl p-8 border border-rose-200 dark:border-rose-900 bg-rose-50/20">
              <AlertTriangle size={32} className="mx-auto text-rose-500 mb-2" />
              <h2 className="text-base font-bold text-rose-600 dark:text-rose-400">Unable to load your reports</h2>
              <p className="text-xs text-slate-500 mt-1">{error}</p>
              <Button onClick={fetchMyReports} variant="primary" size="sm" icon={RefreshCw} className="mt-4">
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && reportsList.length === 0 && (
          <div className="py-12">
            <EmptyState
              title="No reports yet"
              message="Your generated due diligence reports will appear here."
              actionLabel="Explore Properties"
              onAction={() => navigate("/property-search")}
            />
          </div>
        )}

        {/* SEARCH EMPTY STATE */}
        {!loading && !error && reportsList.length > 0 && sortedReports.length === 0 && (
          <div className="py-8">
            <EmptyState
              title="No matching reports found"
              message={`No due diligence report matched "${searchQuery}".`}
              actionLabel="Clear Search"
              onAction={() => {
                setSearchQuery("");
                setStatusFilter("ALL");
              }}
            />
          </div>
        )}

        {/* REPORT TABLE */}
        {!loading && !error && sortedReports.length > 0 && (
          <div className="white-card rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#334155] text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="p-4">Report ID</th>
                  <th className="p-4">Property</th>
                  <th className="p-4">Generated Date</th>
                  <th className="p-4">Risk Score</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                {paginatedReports.map((report) => {
                  const genDate = report.generatedAt
                    ? new Date(report.generatedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—";

                  const score = Number(report.overallRiskScore || 14);
                  const isLow = score < 30;
                  const isMed = score >= 30 && score < 60;
                  const status = (report.reportStatus || "GENERATED").toUpperCase();

                  return (
                    <tr
                      key={report.reportId}
                      className="hover:bg-slate-50/60 dark:hover:bg-[#0F172A]/50 transition-colors"
                    >
                      {/* Report ID */}
                      <td className="p-4">
                        <span className="font-extrabold text-blue-600 dark:text-cyan-400">
                          #{report.reportId}
                        </span>
                      </td>

                      {/* Property */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <strong className="font-extrabold text-slate-900 dark:text-white text-xs block">
                            {report.propertyName || `Property #${report.propertyId}`}
                          </strong>
                          <span className="text-[11px] text-slate-400">
                            Property ID: #{report.propertyId}
                          </span>
                        </div>
                      </td>

                      {/* Generated Date */}
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-bold">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400 shrink-0" />
                          <span>{genDate}</span>
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isLow
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800"
                              : isMed
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800"
                              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800"
                          }`}
                        >
                          <ShieldCheck size={11} /> {score}/100 ({isLow ? "Low" : isMed ? "Medium" : "High"})
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <Badge variant={status === "GENERATED" || status === "COMPLETED" ? "success" : "warning"}>
                          {status === "GENERATED" ? "Completed" : status}
                        </Badge>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. View / Open in Due Diligence Page */}
                          <button
                            onClick={() => navigate(`/due-diligence-report?id=${report.propertyId}`)}
                            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 text-blue-700 dark:text-cyan-300 transition-colors cursor-pointer"
                            title="View Property Due Diligence"
                          >
                            <ExternalLink size={14} />
                          </button>

                          {/* 2. Preview Modal */}
                          <button
                            onClick={() => setPreviewReport(report)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            title="Preview Report Summary"
                          >
                            <Eye size={14} />
                          </button>

                          {/* 3. Download PDF */}
                          <button
                            onClick={() => handleDownloadPdf(report)}
                            disabled={downloadingId === report.reportId}
                            className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </button>

                          {/* 4. Download Excel */}
                          <button
                            onClick={() => handleDownloadExcel(report)}
                            disabled={downloadingExcelId === report.reportId}
                            className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                            title="Download Excel"
                          >
                            <FileSpreadsheet size={14} />
                          </button>

                          {/* 5. Delete */}
                          <button
                            onClick={() => handleDelete(report)}
                            className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 text-rose-600 dark:text-rose-300 hover:text-white transition-colors cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {!loading && !error && sortedReports.length > 0 && (
          <div className="white-card rounded-3xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-slate-500 dark:text-slate-400">
              Showing {Math.min((currentPage - 1) * rowsPerPage + 1, sortedReports.length)} - {Math.min(currentPage * rowsPerPage, sortedReports.length)} of {sortedReports.length} reports
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl px-2.5 py-1 text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-bold border border-blue-200 dark:border-blue-800">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW REPORT MODAL */}
        <AnimatePresence>
          {previewReport && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewReport(null)}
                className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">
                      REPORT #{previewReport.reportId} PREVIEW
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                      {previewReport.reportName || `Due Diligence Report - ${previewReport.propertyName}`}
                    </h2>
                  </div>
                  <button
                    onClick={() => setPreviewReport(null)}
                    className="p-2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Property Name</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold text-xs block mt-0.5">
                        {previewReport.propertyName || `Property #${previewReport.propertyId}`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Property ID</span>
                      <strong className="text-blue-600 dark:text-cyan-400 font-extrabold text-xs block mt-0.5">
                        PROP-#{previewReport.propertyId}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Generated Date</span>
                      <strong className="text-slate-700 dark:text-slate-300 font-bold text-xs block mt-0.5">
                        {previewReport.generatedAt
                          ? new Date(previewReport.generatedAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Due Diligence Risk Score</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs block mt-0.5">
                        {previewReport.overallRiskScore || 14} / 100 ({Number(previewReport.overallRiskScore || 14) < 30 ? "Low Risk" : "Moderate Risk"})
                      </strong>
                    </div>
                  </div>

                  {previewReport.executiveSummary && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1.5">
                      <span className="text-slate-400 text-[10px] uppercase font-bold block">Executive Summary</span>
                      <pre className="text-slate-700 dark:text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                        {previewReport.executiveSummary}
                      </pre>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex flex-wrap items-center justify-between gap-3">
                  <Button
                    onClick={() => {
                      setPreviewReport(null);
                      navigate(`/due-diligence-report?id=${previewReport.propertyId}`);
                    }}
                    variant="outline"
                    size="sm"
                    icon={ExternalLink}
                  >
                    Open Due Diligence
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleDownloadPdf(previewReport)}
                      variant="primary"
                      size="sm"
                      icon={Download}
                      disabled={downloadingId === previewReport.reportId}
                    >
                      Download PDF
                    </Button>
                    <Button
                      onClick={() => handleDownloadExcel(previewReport)}
                      variant="secondary"
                      size="sm"
                      icon={FileSpreadsheet}
                      disabled={downloadingExcelId === previewReport.reportId}
                    >
                      Excel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

export default ReportHistory;
