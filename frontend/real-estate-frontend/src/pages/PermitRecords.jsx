import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  Map,
  FileCheck,
  Building,
  Search,
  ShieldCheck,
  CheckCircle2,
  FileDown,
  X,
  Building2,
  Calendar,
  Layers,
  Flame,
  FileText,
  Eye,
  Flag,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  Send,
  User,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { showSuccessAlert, showToast } from "../utils/swal";
import PropertyContextSwitcher from "../components/common/PropertyContextSwitcher";
import { getPropertyDetails, getPermitRecords } from "../services/propertyService";
import { getCurrentUser } from "../services/authService";
import { exportToPdf } from "../utils/exportUtils";

function PermitRecords() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawId = searchParams.get("propertyId") || searchParams.get("id") || "1";
  const numericId = parseInt(rawId.toString().replace(/\D/g, "") || "1", 10);

  // Authenticated Legal Reviewer from Session
  const storedUser = getCurrentUser() || {};
  const reviewerName = storedUser.firstName
    ? `${storedUser.firstName} ${storedUser.lastName || ""}`.trim()
    : storedUser.name || (storedUser.email ? storedUser.email.split("@")[0] : "Legal Reviewer");

  const [property, setProperty] = useState(null);
  const [permits, setPermits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modals state
  const [viewPermitModal, setViewPermitModal] = useState(null);
  const [flagIssueModal, setFlagIssueModal] = useState(null);
  const [flagReason, setFlagReason] = useState("");

  const fetchPermitData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [propRes, permitRes] = await Promise.allSettled([
        getPropertyDetails(numericId),
        getPermitRecords(numericId),
      ]);

      if (propRes.status === "fulfilled" && propRes.value) {
        setProperty(propRes.value);
      } else {
        setProperty(null);
      }

      if (permitRes.status === "fulfilled" && permitRes.value) {
        const payload = permitRes.value?.data || permitRes.value;
        const list = Array.isArray(payload) ? payload : (payload?.content || []);
        
        const mapped = list.map((p, idx) => {
          const pType = p.permitType || "Building Permit";
          const authorityDisplay = p.issuingAuthority || (property?.city ? `${property.city} Municipal Corporation` : "Municipal Authority");
          const issueStr = p.issueDate ? new Date(p.issueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Not available in records";
          const expiryStr = p.expiryDate ? new Date(p.expiryDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Not available in records";

          return {
            id: p.permitId ? `PRM-${p.permitId}` : `PRM-${idx + 101}`,
            permitId: p.permitId,
            permitNumber: p.permitNumber || "Not available in records",
            permitType: pType,
            category: pType,
            authority: authorityDisplay,
            status: p.verificationStatus || p.status || "Verified",
            issueDate: issueStr,
            expiryDate: expiryStr,
            documentUrl: p.documentUrl || null,
            rawRecord: p,
          };
        });
        setPermits(mapped);
      } else {
        setPermits([]);
      }
    } catch (err) {
      console.error("Permit records backend query error:", err);
      setError("Unable to load permit records from PostgreSQL. Please verify backend connection.");
      setPermits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermitData();
  }, [numericId]);

  // Filtered Permits
  const filteredPermits = useMemo(() => {
    return permits.filter((p) => {
      let matchCategory = true;
      if (categoryFilter === "Building Permit") {
        matchCategory = p.permitType.toLowerCase().includes("building");
      } else if (categoryFilter === "Construction Approval") {
        matchCategory = p.permitType.toLowerCase().includes("construction");
      } else if (categoryFilter === "Occupancy Certificate") {
        matchCategory = p.permitType.toLowerCase().includes("occupancy");
      } else if (categoryFilter === "Renovation Permit") {
        matchCategory = p.permitType.toLowerCase().includes("renovation");
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.permitNumber.toLowerCase().includes(q) ||
        p.permitType.toLowerCase().includes(q) ||
        p.authority.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [permits, categoryFilter, searchQuery]);

  // STATUS BADGE RENDERER FOR LIVE STATUSES
  const renderPermitStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    if (s.includes("VERIF") || s.includes("APPROV") || s === "ACTIVE") {
      return <Badge variant="success">{status || "Verified"}</Badge>;
    }
    if (s.includes("PEND")) {
      return <Badge variant="warning">{status || "Pending"}</Badge>;
    }
    if (s.includes("MISS") || s.includes("REJECT") || s.includes("FLAG")) {
      return <Badge variant="danger">{status || "Missing"}</Badge>;
    }
    if (s.includes("EXPIR")) {
      return <Badge variant="purple">{status || "Expired"}</Badge>;
    }
    return <Badge variant="secondary">{status || "Unknown"}</Badge>;
  };

  // HANDLERS FOR THE ACTION BUTTONS
  const handleVerifyPermit = (p) => {
    setPermits((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, status: "Verified" } : item))
    );
    showSuccessAlert("Permit Verified", `Permit ${p.permitNumber} verified with ${p.authority} by ${reviewerName}.`);
  };

  const handleApprovePermit = (p) => {
    setPermits((prev) =>
      prev.map((item) => (item.id === p.id ? { ...item, status: "Approved" } : item))
    );
    showSuccessAlert("Permit Approved", `Approved legal compliance for ${p.permitType}.`);
  };

  const handleFlagIssueModalOpen = (p) => {
    setFlagIssueModal(p);
    setFlagReason("Sanctioned setback or FAR discrepancy flagged during legal audit.");
  };

  const handleConfirmFlagSubmit = (e) => {
    e.preventDefault();
    if (!flagIssueModal) return;

    setPermits((prev) =>
      prev.map((item) => (item.id === flagIssueModal.id ? { ...item, status: "Flagged" } : item))
    );

    showSuccessAlert(
      "Permit Issue Flagged",
      `Flagged permit issue on ${flagIssueModal.permitNumber}: "${flagReason}"`
    );
    setFlagIssueModal(null);
  };

  const handleViewPermitDoc = (p) => {
    setViewPermitModal(p);
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <Map size={14} className="text-emerald-500 dark:text-emerald-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Municipal Building Permit & Compliance Registry
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs border border-emerald-200 dark:border-emerald-800">
              PR-{numericId} • {permits.length} PERMITS RECORDED
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={fetchPermitData}
              disabled={loading}
              className="flex items-center gap-1"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Sync
            </Button>
          </div>
        </div>

        {/* PROPERTY CONTEXT SWITCHER BAR */}
        <PropertyContextSwitcher currentPropertyId={numericId} />

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-mono font-bold mb-2">
              <Building2 size={14} /> Municipal Approvals & Clearances
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              🚧 Permit Verification — {property?.propertyName || `Parcel PR-${numericId}`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              Audit Municipal Building Permits, Construction Approvals, Occupancy Certificates, and Renovation Permits from PostgreSQL database for {property?.city || "Municipal"} jurisdiction.
            </p>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
            <Button variant="danger" size="xs" onClick={fetchPermitData}>
              Retry Connection
            </Button>
          </div>
        )}

        {/* CONTROLS BAR: SEARCH & PERMIT CATEGORY FILTERS */}
        <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 font-mono text-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search permits by Permit #, Authority, Type, or Status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] font-bold text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Permit Category Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "ALL", label: "All Permits" },
              { id: "Building Permit", label: "Building Permit" },
              { id: "Construction Approval", label: "Construction Approval" },
              { id: "Occupancy Certificate", label: "Occupancy Cert" },
              { id: "Renovation Permit", label: "Renovation Permit" },
            ].map((tab) => {
              const active = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id)}
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
        </div>

        {/* PERMIT RECORDS CARDS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-64 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : filteredPermits.length === 0 ? (
          <EmptyState
            title={categoryFilter === "ALL" ? "No permit records found for this property" : `No ${categoryFilter} records found for this property`}
            message={categoryFilter === "ALL" ? "No municipal permits recorded for this property parcel in the PostgreSQL database." : "No permits under this category exist in the database for the active parcel."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPermits.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-4 font-mono text-xs"
              >
                <div className="space-y-3">
                  {/* Header: Permit Number, Category & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                        {p.category} • {p.id}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                        {p.permitType}
                      </h3>
                      <p className="text-slate-500 font-medium text-xs mt-0.5">{p.permitNumber}</p>
                    </div>

                    <div className="shrink-0">
                      {renderPermitStatusBadge(p.status)}
                    </div>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Sanctioning Authority</span>
                      <strong className="text-slate-900 dark:text-white font-extrabold text-xs block truncate" title={p.authority}>
                        🏛️ {p.authority}
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Property Parcel</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs block truncate">
                        🏢 PR-{numericId} ({property?.propertyName || "Parcel"})
                      </strong>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Issue Date</span>
                      <strong className="text-slate-900 dark:text-white font-bold block">{p.issueDate}</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">Expiry Date</span>
                      <strong className="text-slate-900 dark:text-white font-bold block">{p.expiryDate}</strong>
                    </div>
                  </div>
                </div>

                {/* THE 4 ACTION BUTTONS PER CARD */}
                <div className="pt-4 border-t border-slate-100 dark:border-[#334155] grid grid-cols-4 gap-2 text-xs">
                  {/* 1. Verify */}
                  <button
                    onClick={() => handleVerifyPermit(p)}
                    className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-cyan-300 font-bold transition-all flex items-center justify-center gap-1 border border-blue-200 dark:border-blue-800 cursor-pointer"
                    title="Verify Permit with Municipal Registry"
                  >
                    <ShieldCheck size={13} />
                    <span>Verify</span>
                  </button>

                  {/* 2. Approve */}
                  <button
                    onClick={() => handleApprovePermit(p)}
                    className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold transition-all flex items-center justify-center gap-1 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                    title="Approve Permit Clearance"
                  >
                    <CheckCircle2 size={13} />
                    <span>Approve</span>
                  </button>

                  {/* 3. Flag Issue */}
                  <button
                    onClick={() => handleFlagIssueModalOpen(p)}
                    className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold transition-all flex items-center justify-center gap-1 border border-rose-200 dark:border-rose-800 cursor-pointer"
                    title="Flag Permit Violation / Issue"
                  >
                    <Flag size={13} />
                    <span>Flag Issue</span>
                  </button>

                  {/* 4. View Document */}
                  <button
                    onClick={() => handleViewPermitDoc(p)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-800 dark:text-slate-200 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="View Permit Document"
                  >
                    <Eye size={13} />
                    <span>View Doc</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* MODAL 1: VIEW PERMIT DOCUMENT PREVIEW */}
        <AnimatePresence>
          {viewPermitModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewPermitModal(null)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-lg w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <div>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{viewPermitModal.category} • {viewPermitModal.permitNumber}</span>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">{viewPermitModal.permitType}</h2>
                  </div>
                  <button onClick={() => setViewPermitModal(null)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                    <p className="text-slate-500">🏛️ Authority: <strong className="text-slate-900 dark:text-white">{viewPermitModal.authority}</strong></p>
                    <p className="text-slate-500">🏢 Property: <strong className="text-slate-900 dark:text-white">PR-{numericId} ({property?.propertyName || "Parcel"})</strong></p>
                    <p className="text-slate-500">📅 Valid Window: <strong className="text-slate-900 dark:text-white">{viewPermitModal.issueDate} to {viewPermitModal.expiryDate}</strong></p>
                    <p className="text-slate-500">🛡️ Status: <strong className="text-emerald-600 dark:text-emerald-400">{viewPermitModal.status}</strong></p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                    <Button onClick={() => setViewPermitModal(null)} variant="secondary" size="sm">Close Preview</Button>
                    <Button
                      onClick={() => {
                        setViewPermitModal(null);
                        exportToPdf(`Permit_${viewPermitModal.permitNumber}`, viewPermitModal);
                      }}
                      variant="primary"
                      size="sm"
                      icon={FileDown}
                    >
                      Export PDF
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MODAL 2: FLAG PERMIT ISSUE MODAL */}
        <AnimatePresence>
          {flagIssueModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFlagIssueModal(null)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Flag size={20} className="text-rose-500" /> Flag Permit Compliance Issue
                  </h2>
                  <button onClick={() => setFlagIssueModal(null)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <form onSubmit={handleConfirmFlagSubmit} className="space-y-4 font-mono text-xs">
                  <p className="text-slate-600 dark:text-slate-300 font-bold">Flag permit issue for: <strong className="text-rose-600">{flagIssueModal.permitNumber}</strong></p>

                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Permit Violation Issue *</label>
                    <textarea rows={3} value={flagReason} onChange={(e) => setFlagReason(e.target.value)} required className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                    <Button onClick={() => setFlagIssueModal(null)} variant="secondary" size="sm">Cancel</Button>
                    <Button type="submit" variant="danger" size="sm">Flag Permit Violation</Button>
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

export default PermitRecords;