import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  ShieldCheck,
  FileSearch,
  CheckSquare,
  AlertOctagon,
  Home,
  ChevronRight,
  UserCheck,
  X,
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  Eye,
  RefreshCw,
  Send,
  Building2,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  MapPin,
  ExternalLink,
  FileCheck2,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import { showSuccessAlert, showToast } from "../utils/swal";
import { getAllProperties } from "../services/propertyService";
import { getMyReports, generateReport, updateReport } from "../services/reportService";
import { getMyAssessments } from "../services/riskService";
import { getCurrentUser } from "../services/authService";

function LegalReviews() {
  const navigate = useNavigate();

  // Current Authenticated Legal Reviewer
  const storedUser = getCurrentUser() || {};
  const userName = storedUser.firstName
    ? `${storedUser.firstName} ${storedUser.lastName || ""}`.trim()
    : storedUser.name || (storedUser.email ? storedUser.email.split("@")[0] : "Legal Reviewer");
  const userRole = storedUser.role || "Legal Reviewer";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Modal State
  const [reviewModalItem, setReviewModalItem] = useState(null);
  const [modalMode, setModalMode] = useState("VIEW"); // 'VIEW', 'CONTINUE', 'SUBMIT'
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedVerdict, setSelectedVerdict] = useState("Approved");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load real properties, reports, and risk assessments from PostgreSQL
  const fetchLegalReviews = async (isManualRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const [propsRes, reportsRes, riskRes] = await Promise.allSettled([
        getAllProperties(0, 50),
        getMyReports(),
        getMyAssessments(),
      ]);

      const rawProps = propsRes.status === "fulfilled"
        ? (propsRes.value?.content || (Array.isArray(propsRes.value) ? propsRes.value : propsRes.value?.data?.content || []))
        : [];

      const rawReports = reportsRes.status === "fulfilled"
        ? (Array.isArray(reportsRes.value?.data) ? reportsRes.value.data : (Array.isArray(reportsRes.value) ? reportsRes.value : []))
        : [];

      const rawRisk = riskRes.status === "fulfilled"
        ? (Array.isArray(riskRes.value?.data) ? riskRes.value.data : (Array.isArray(riskRes.value) ? riskRes.value : []))
        : [];

      // Create indexed lookups for real reports and risk records by propertyId
      const reportMap = new Map();
      rawReports.forEach((rpt) => {
        if (rpt.propertyId) reportMap.set(String(rpt.propertyId), rpt);
      });

      const riskMap = new Map();
      rawRisk.forEach((rsk) => {
        if (rsk.propertyId) riskMap.set(String(rsk.propertyId), rsk);
      });

      // Construct live review records strictly from database properties and report linkages
      const liveReviews = rawProps.map((p, idx) => {
        const pId = String(p.propertyId || p.id || idx + 1);
        const pName = p.propertyName || `Property Parcel PR-${pId}`;
        const pCode = p.propertyCode || `PR-${pId}`;
        const pCity = (typeof p.city === "string" && p.city.trim()) || p.address?.city || "Urban";
        const pState = (typeof p.state === "string" && p.state.trim()) || p.address?.state || "State";
        const pAddress = p.addressLine1 || p.address?.addressLine1 || `${pCity}, ${pState}`;
        const pMarketVal = p.marketValue ? `₹ ${(Number(p.marketValue) / 10000000).toFixed(2)} Cr` : "Appraisal Active";

        const existingReport = reportMap.get(pId);
        const existingRisk = riskMap.get(pId);

        // Buyer / Client identity from entity
        const buyerIdentity = p.createdByEmail
          ? p.createdByEmail.split("@")[0].toUpperCase() + " (Buyer Portfolio)"
          : `Client Account #CL-${p.createdById || pId}`;

        // Priority derived from actual risk assessment level or property status
        let priority = "Medium";
        if (existingRisk?.riskLevel === "CRITICAL" || p.status === "FLAGGED") {
          priority = "Critical";
        } else if (existingRisk?.riskLevel === "HIGH" || p.status === "UNDER_REVIEW") {
          priority = "High";
        } else if (existingRisk?.riskLevel === "LOW" || p.status === "VERIFIED") {
          priority = "Low";
        }

        // Live Status mapping
        let status = "Under Review";
        if (existingReport?.reportStatus) {
          const rSt = existingReport.reportStatus.toUpperCase();
          if (rSt.includes("COMPLET") || rSt.includes("VERIF") || rSt.includes("APPROV")) {
            status = "Approved";
          } else if (rSt.includes("REJECT") || rSt.includes("FLAG")) {
            status = "Rejected";
          } else if (rSt.includes("PEND")) {
            status = "Pending";
          } else {
            status = "Under Review";
          }
        } else if (p.status === "VERIFIED") {
          status = "Approved";
        } else if (p.status === "FLAGGED") {
          status = "Rejected";
        }

        // Real Timestamps
        const assignedDateObj = p.createdAt ? new Date(p.createdAt) : new Date();
        const dueDateObj = new Date(assignedDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);

        const assignedDateStr = assignedDateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        const dueDateStr = dueDateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

        return {
          id: `REV-LEG-${pId.padStart(4, "0")}`,
          rawId: pId,
          reportId: existingReport?.reportId || null,
          property: `${pName} (${pCode})`,
          propertyName: pName,
          propertyCode: pCode,
          propertyId: pId,
          address: pAddress,
          city: pCity,
          state: pState,
          marketValue: pMarketVal,
          buyer: buyerIdentity,
          priority,
          status,
          assignedDate: assignedDateStr,
          assignedDateRaw: assignedDateObj,
          dueDate: dueDateStr,
          dueDateRaw: dueDateObj,
          deedDetails: existingReport?.executiveSummary || `Sub-Registrar registered deed verification and 30-year search title check for ${pName}.`,
          riskScore: existingRisk?.riskScore ? Number(existingRisk.riskScore) : (p.status === "VERIFIED" ? 12 : 38),
          riskLevel: existingRisk?.riskLevel || "Standard",
          reviewer: userName,
        };
      });

      setReviews(liveReviews);
      if (isManualRefresh) {
        showToast("Assigned reviews and deed search synchronized with live database.", "success");
      }
    } catch (err) {
      console.error("Failed to load legal reviews:", err);
      setError("Unable to load reviews from PostgreSQL. Please verify Spring Boot backend is active.");
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegalReviews();
  }, []);

  // Filtered & Sorted Reviews
  const processedReviews = useMemo(() => {
    let list = reviews.filter((r) => {
      const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        r.id.toLowerCase().includes(q) ||
        r.property.toLowerCase().includes(q) ||
        r.propertyName.toLowerCase().includes(q) ||
        r.propertyId.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q) ||
        r.buyer.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q) ||
        r.priority.toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });

    if (sortBy === "NEWEST") {
      list.sort((a, b) => b.assignedDateRaw - a.assignedDateRaw);
    } else if (sortBy === "OLDEST") {
      list.sort((a, b) => a.assignedDateRaw - b.assignedDateRaw);
    } else if (sortBy === "PRIORITY") {
      const priorityMap = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      list.sort((a, b) => (priorityMap[b.priority] || 0) - (priorityMap[a.priority] || 0));
    } else if (sortBy === "PROPERTY") {
      list.sort((a, b) => a.propertyName.localeCompare(b.propertyName));
    } else if (sortBy === "DUE_DATE") {
      list.sort((a, b) => a.dueDateRaw - b.dueDateRaw);
    }

    return list;
  }, [reviews, searchQuery, statusFilter, sortBy]);

  // Paginated List
  const totalPages = Math.ceil(processedReviews.length / itemsPerPage) || 1;
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedReviews.slice(start, start + itemsPerPage);
  }, [processedReviews, currentPage, itemsPerPage]);

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return <Badge variant="warning">Pending</Badge>;
      case "Under Review":
        return <Badge variant="info">Under Review</Badge>;
      case "Approved":
        return <Badge variant="success">Approved</Badge>;
      case "Rejected":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Priority Badge Helper
  const renderPriorityBadge = (priority) => {
    switch (priority) {
      case "Critical":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 font-mono font-bold text-[10px] border border-rose-200 dark:border-rose-800">
            CRITICAL
          </span>
        );
      case "High":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 font-mono font-bold text-[10px] border border-amber-200 dark:border-amber-800">
            HIGH
          </span>
        );
      case "Medium":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-cyan-300 font-mono font-bold text-[10px] border border-blue-200 dark:border-blue-800">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-mono font-bold text-[10px] border border-slate-200 dark:border-slate-700">
            LOW
          </span>
        );
    }
  };

  // 1. OPEN REVIEW ACTION
  const handleOpenReview = (item) => {
    setReviewModalItem(item);
    setModalMode("VIEW");
    setReviewNotes(item.deedDetails || "");
  };

  // 2. CONTINUE REVIEW ACTION
  const handleContinueReview = (item) => {
    navigate(`/property-review?id=${item.propertyId}`);
  };

  // 3. SUBMIT VERDICT ACTION
  const handleSubmitReview = (item) => {
    setReviewModalItem(item);
    setModalMode("SUBMIT");
    setSelectedVerdict(item.status === "Approved" ? "Approved" : "Approved");
    setReviewNotes(item.deedDetails || "");
  };

  // Save Legal Verdict to Backend PostgreSQL
  const handleConfirmSubmitVerdict = async (e) => {
    e.preventDefault();
    if (!reviewModalItem) return;

    try {
      setIsSubmitting(true);
      const statusMap = {
        Approved: "COMPLETED",
        "Under Review": "IN_PROGRESS",
        Rejected: "FLAGGED",
        Pending: "PENDING",
      };

      const payload = {
        propertyId: Number(reviewModalItem.propertyId),
        reportName: `Legal Title Audit - ${reviewModalItem.propertyName}`,
        reportStatus: statusMap[selectedVerdict] || "COMPLETED",
        executiveSummary: reviewNotes || `Legal review verdict '${selectedVerdict}' recorded by ${userName}.`,
        overallRiskScore: selectedVerdict === "Approved" ? 10 : (selectedVerdict === "Rejected" ? 85 : 45),
      };

      if (reviewModalItem.reportId) {
        await updateReport(reviewModalItem.reportId, payload);
      } else {
        await generateReport(payload);
      }

      showSuccessAlert(
        "Legal Verdict Saved to Database",
        `Submitted legal review verdict "${selectedVerdict}" for ${reviewModalItem.property}.`
      );

      setReviewModalItem(null);
      await fetchLegalReviews();
    } catch (err) {
      console.error("Failed to submit review verdict:", err);
      showToast("Failed to save legal verdict to database. Please retry.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <Home size={14} className="text-blue-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Assigned Legal Reviews & Title Search
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              POSTGRESQL QUEUE • {reviews.length} ASSIGNED REVIEWS
            </span>

            <Button
              variant="outline"
              size="xs"
              onClick={() => fetchLegalReviews(true)}
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
              <Scale size={14} /> Title Deed Audit Workstation
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              📜 Assigned Reviews & Deed Search
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              Inspect 30-year sub-registrar land title deeds, Pahani records, encumbrance certificates, and persist legal verdicts.
            </p>
          </div>

          <div className="text-right">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Legal Reviewer</span>
            <strong className="text-slate-900 dark:text-white font-extrabold text-sm block">{userName}</strong>
            <span className="text-[11px] text-blue-600 dark:text-cyan-400 font-bold">{userRole}</span>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
            <Button variant="danger" size="xs" onClick={() => fetchLegalReviews(true)}>
              Retry Connection
            </Button>
          </div>
        )}

        {/* CONTROLS BAR: SEARCH, SORT & STATUS FILTER BADGES */}
        <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono text-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reviews by ID, Property, Buyer, Priority, or Status..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              {[
                { id: "ALL", label: "All" },
                { id: "Pending", label: "Pending" },
                { id: "Under Review", label: "Under Review" },
                { id: "Approved", label: "Approved" },
                { id: "Rejected", label: "Rejected" },
              ].map((tab) => {
                const active = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setStatusFilter(tab.id);
                      setCurrentPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold ${
                      active
                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs"
                        : "bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0F172A] px-3 py-2 rounded-xl border border-slate-200 dark:border-[#334155] text-xs font-mono font-bold">
              <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="NEWEST">Sort: Newest First</option>
                <option value="OLDEST">Sort: Oldest First</option>
                <option value="PRIORITY">Sort: Priority High-Low</option>
                <option value="PROPERTY">Sort: Property Name</option>
                <option value="DUE_DATE">Sort: Due Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* ASSIGNED REVIEWS TABLE */}
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : paginatedReviews.length === 0 ? (
          <EmptyState
            title="No reviews assigned"
            message="New legal review requests and title search parcels assigned to you will appear here."
          />
        ) : (
          <div className="white-card rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                  <th className="p-4">Review ID</th>
                  <th className="p-4">Property Parcel</th>
                  <th className="p-4">Buyer / Client</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned Date</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4 text-right">Actions (Open • Continue • Submit)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                {paginatedReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-[#0F172A]/50 transition-colors">
                    {/* Review ID */}
                    <td className="p-4 font-bold text-blue-600 dark:text-cyan-400">
                      {r.id}
                    </td>

                    {/* Property */}
                    <td className="p-4">
                      <strong className="font-extrabold text-slate-900 dark:text-white text-xs block">
                        {r.property}
                      </strong>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        📍 {r.city}, {r.state} • {r.marketValue}
                      </span>
                    </td>

                    {/* Buyer */}
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                      👤 {r.buyer}
                    </td>

                    {/* Priority */}
                    <td className="p-4">
                      {renderPriorityBadge(r.priority)}
                    </td>

                    {/* Status Badges */}
                    <td className="p-4">
                      {renderStatusBadge(r.status)}
                    </td>

                    {/* Assigned Date */}
                    <td className="p-4 text-slate-400">{r.assignedDate}</td>

                    {/* Due Date */}
                    <td className="p-4 text-slate-400">{r.dueDate}</td>

                    {/* THE 3 REQUIRED ACTION BUTTONS PER ROW */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. Open Review */}
                        <button
                          onClick={() => handleOpenReview(r)}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                          title="1. Open Review Details"
                        >
                          <Eye size={14} />
                        </button>

                        {/* 2. Continue Review */}
                        <button
                          onClick={() => handleContinueReview(r)}
                          className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-cyan-300 transition-colors cursor-pointer"
                          title="2. Continue Review Workspace"
                        >
                          <RefreshCw size={14} />
                        </button>

                        {/* 3. Submit Review */}
                        <button
                          onClick={() => handleSubmitReview(r)}
                          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                          title="3. Submit Legal Verdict"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION BAR */}
            <div className="p-4 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-xs font-mono text-slate-500">
              <span>
                Showing Page {currentPage} of {totalPages} ({processedReviews.length} total reviews)
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] disabled:opacity-40 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] disabled:opacity-40 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL WORKSTATION FOR REVIEW (OPEN / CONTINUE / SUBMIT) */}
        <AnimatePresence>
          {reviewModalItem && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setReviewModalItem(null)}
                className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-xl w-full space-y-5 font-mono text-xs"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#334155]">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">
                      {reviewModalItem.id} • {modalMode} MODE
                    </span>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">
                      {reviewModalItem.property}
                    </h2>
                  </div>
                  <button
                    onClick={() => setReviewModalItem(null)}
                    className="p-2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleConfirmSubmitVerdict} className="space-y-4">
                  {/* Property & Review Attributes */}
                  <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                    <div>
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Buyer / Client</span>
                      <p className="text-slate-900 dark:text-white font-extrabold text-xs truncate">
                        {reviewModalItem.buyer}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Market Valuation</span>
                      <p className="text-blue-600 dark:text-cyan-400 font-extrabold text-xs">
                        {reviewModalItem.marketValue}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Location Address</span>
                      <p className="text-slate-600 dark:text-slate-300 font-medium text-[11px] truncate">
                        {reviewModalItem.address}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase font-bold text-[10px]">Review Timeline</span>
                      <p className="text-slate-500 text-[11px]">
                        {reviewModalItem.assignedDate} → {reviewModalItem.dueDate}
                      </p>
                    </div>
                  </div>

                  {/* Verdict Selector for Submit Mode */}
                  {modalMode === "SUBMIT" && (
                    <div>
                      <label className="block text-slate-400 uppercase font-bold mb-1">
                        Select Legal Review Verdict *
                      </label>
                      <select
                        value={selectedVerdict}
                        onChange={(e) => setSelectedVerdict(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold focus:outline-none"
                      >
                        <option value="Approved">Approved (Clear 30-Year Title Verified)</option>
                        <option value="Under Review">Under Review (Further Municipal Check)</option>
                        <option value="Rejected">Rejected (Encumbrance / Dispute Flagged)</option>
                        <option value="Pending">Pending (Awaiting Survey Records)</option>
                      </select>
                    </div>
                  )}

                  {/* Legal Notes */}
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">
                      Sub-Registrar Title Findings & Legal Notes
                    </label>
                    <textarea
                      rows={3}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Record title chain trace, deed deed encumbrance search findings..."
                      readOnly={modalMode === "VIEW"}
                      className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold text-xs"
                    />
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-slate-200 dark:border-[#334155] flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        setReviewModalItem(null);
                        navigate(`/property-review?id=${reviewModalItem.propertyId}`);
                      }}
                      className="flex items-center gap-1 text-blue-600 dark:text-cyan-400"
                    >
                      <ExternalLink size={12} />
                      <span>Open Review Dossier</span>
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        onClick={() => setReviewModalItem(null)}
                        variant="secondary"
                        size="xs"
                      >
                        Close
                      </Button>

                      {modalMode === "SUBMIT" && (
                        <Button
                          type="submit"
                          variant="primary"
                          size="xs"
                          icon={Send}
                          loading={isSubmitting}
                        >
                          Save Verdict to DB
                        </Button>
                      )}
                    </div>
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

export default LegalReviews;
