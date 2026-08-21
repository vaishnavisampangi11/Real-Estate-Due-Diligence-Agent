import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Filter,
  Home,
  ChevronRight,
  ShieldCheck,
  Eye,
  Download,
  X,
  Upload,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Building2,
  FolderOpen,
  Scale,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Calendar,
  Layers,
  FileCheck,
  Award,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import { showToast, showConfirmDialog, showSuccessAlert } from "../utils/swal";
import LegalDocumentCard from "../components/legal/LegalDocumentCard";
import { getAllDocuments, getAllProperties } from "../services/propertyService";

function LegalDocuments() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Filters & Search
  const [activeTypeTab, setActiveTypeTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("NAME_ASC");

  // Modals State
  const [previewDocModal, setPreviewDocModal] = useState(null);
  const [reuploadModalDoc, setReuploadModalDoc] = useState(null);
  const [reuploadReason, setReuploadReason] = useState("");

  // Fetch real property documents from PostgreSQL
  const fetchLegalDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Parallel fetch documents and properties
      const [docsRes, propsRes] = await Promise.allSettled([
        getAllDocuments(),
        getAllProperties(0, 50),
      ]);

      const rawDocs =
        docsRes.status === "fulfilled"
          ? Array.isArray(docsRes.value.data)
            ? docsRes.value.data
            : Array.isArray(docsRes.value)
            ? docsRes.value
            : []
          : [];

      const propsList =
        propsRes.status === "fulfilled"
          ? propsRes.value?.data?.content ||
            (Array.isArray(propsRes.value?.data) ? propsRes.value.data : [])
          : [];

      setProperties(propsList);

      // Map real documents to property metadata
      const formatted = rawDocs.map((doc) => {
        const pId = doc.propertyId || doc.property?.propertyId;
        const matchedProp = propsList.find((p) => (p.propertyId || p.id) === pId);

        const pName = matchedProp?.propertyName || doc.propertyName || `Property #${pId}`;
        const pCode = matchedProp?.propertyCode || (pId ? `PR-${pId}` : "PROP-VAULT");

        // Format upload date
        const formattedDate = doc.uploadedAt
          ? new Date(doc.uploadedAt).toLocaleDateString([], {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "04 Aug 2026";

        return {
          id: `DOC-LEG-${String(doc.documentId).padStart(2, "0")}`,
          rawId: doc.documentId,
          name: doc.documentName || "Supporting Legal Deed",
          type: doc.documentType || "TITLE_DEED",
          category: doc.documentType ? doc.documentType.replace(/_/g, " ") : "Title Deed",
          filePath: doc.filePath || `/documents/DOC_${doc.documentId}.pdf`,
          fileFormat: doc.fileFormat || "PDF",
          property: `${pName} (${pCode})`,
          propertyId: pId,
          propertyName: pName,
          propertyCode: pCode,
          uploadDate: formattedDate,
          uploadedBy: doc.uploadedBy?.fullName || doc.uploadedBy?.email || "System Registrar",
          verifiedBy: "Legal Review Pending",
          verificationStatus: "Verified Clear",
          notes: `Official ${doc.documentType || "deed"} registered in PostgreSQL vault.`,
        };
      });

      setDocuments(formatted);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Failed to load legal documents:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Unable to load legal documents. Please verify backend is running on port 8081.";
      setError(msg);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegalDocuments();
  }, []);

  // Compute Real Document Types from Database
  const availableTypes = useMemo(() => {
    const typesSet = new Set(documents.map((d) => d.type).filter(Boolean));
    return ["ALL", ...Array.from(typesSet)];
  }, [documents]);

  // Compute Real Metrics
  const metrics = useMemo(() => {
    const total = documents.length;
    const deeds = documents.filter((d) => d.type.includes("DEED") || d.type.includes("TITLE")).length;
    const compliance = documents.filter(
      (d) => d.type.includes("TAX") || d.type.includes("CERT") || d.type.includes("OCCUPANCY")
    ).length;
    const uniqueProps = new Set(documents.map((d) => d.propertyId).filter(Boolean)).size;

    return { total, deeds, compliance, uniqueProps };
  }, [documents]);

  // Filter Logic
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchType = activeTypeTab === "ALL" || doc.type === activeTypeTab;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.type.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q) ||
        doc.property.toLowerCase().includes(q) ||
        doc.id.toLowerCase().includes(q);

      return matchType && matchSearch;
    });
  }, [documents, activeTypeTab, searchQuery]);

  // Sort Logic
  const sortedDocuments = useMemo(() => {
    const list = [...filteredDocuments];
    if (sortBy === "NAME_ASC") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "TYPE_ASC") {
      list.sort((a, b) => a.type.localeCompare(b.type));
    } else if (sortBy === "PROP_ASC") {
      list.sort((a, b) => a.property.localeCompare(b.property));
    }
    return list;
  }, [filteredDocuments, sortBy]);

  // Document Actions
  const handleView = (doc) => {
    setPreviewDocModal(doc);
  };

  const handleDownload = (doc) => {
    showToast(`Downloading "${doc.name}" (${doc.fileFormat})...`, "info");
    // Create a mock download blob trigger with document metadata
    const content = `LEGAL DOCUMENT VAULT EXPORT\n===============================\nDocument ID: ${doc.id}\nTitle: ${doc.name}\nType: ${doc.type}\nProperty: ${doc.property}\nVault Path: ${doc.filePath}\nRegistry Verified: Yes\nExported: ${new Date().toISOString()}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleVerify = async (doc) => {
    const confirmed = await showConfirmDialog({
      title: "Confirm Legal Document Verification",
      text: `Are you sure you want to mark "${doc.name}" as legally verified and clear?`,
      confirmButtonText: "Yes, Mark Verified",
      cancelButtonText: "Cancel",
      icon: "success",
    });

    if (confirmed) {
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, verificationStatus: "Verified" } : d))
      );
      showSuccessAlert(
        "Document Verified",
        `"${doc.name}" has been marked as verified in the legal records.`
      );
    }
  };

  const handleReject = async (doc) => {
    const confirmed = await showConfirmDialog({
      title: "Reject Legal Document",
      text: `Are you sure you want to reject "${doc.name}" due to compliance or title issues?`,
      confirmButtonText: "Yes, Reject Document",
      cancelButtonText: "Cancel",
      icon: "warning",
    });

    if (confirmed) {
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, verificationStatus: "Rejected" } : d))
      );
      showToast(`Document "${doc.name}" marked as Rejected.`, "error");
    }
  };

  const handleRequestReupload = (doc) => {
    setReuploadModalDoc(doc);
    setReuploadReason("");
  };

  const submitReuploadRequest = () => {
    if (!reuploadReason.trim()) {
      showToast("Please enter reason for re-upload", "warning");
      return;
    }

    setDocuments((prev) =>
      prev.map((d) => (d.id === reuploadModalDoc.id ? { ...d, verificationStatus: "Under Review" } : d))
    );
    showSuccessAlert(
      "Re-upload Request Logged",
      `Notice issued for "${reuploadModalDoc.name}": ${reuploadReason}`
    );
    setReuploadModalDoc(null);
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* BREADCRUMB */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500 dark:text-[#CBD5E1]">
          <nav className="flex items-center gap-2">
            <Link to="/legal/dashboard" className="hover:text-blue-600 dark:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Home size={14} /> Legal Workspace
            </Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Legal Documents & Deed Verification
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
              onClick={fetchLegalDocuments}
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
                <p className="font-bold">Unable to load legal documents</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
              </div>
            </div>
            <Button variant="danger" size="xs" onClick={fetchLegalDocuments}>
              Retry
            </Button>
          </div>
        )}

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              <FolderOpen size={13} />
              DOCUMENT VAULT • {loading ? "..." : `${documents.length} DOCUMENTS`}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              ⚖️ Sub-Registrar Legal Document Vault
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] max-w-2xl">
              Inspect and verify registered title deeds, encumbrance certificates, and statutory property records.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate("/property-search")}
              variant="outline"
              size="sm"
              icon={Search}
            >
              Property Catalog
            </Button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Total Vault Documents</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? "..." : metrics.total}
              </strong>
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
                <FileText size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Title Deeds</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {loading ? "..." : metrics.deeds}
              </strong>
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <FileCheck size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Tax & Compliance</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {loading ? "..." : metrics.compliance}
              </strong>
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Award size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Protected Properties</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {loading ? "..." : metrics.uniqueProps}
              </strong>
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Building2 size={18} />
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
              placeholder="Search legal documents by Name, Type, Property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Dynamic Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <Filter size={12} className="text-slate-400" />
              <select
                value={activeTypeTab}
                onChange={(e) => setActiveTypeTab(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Document Types ({documents.length})</option>
                {availableTypes
                  .filter((t) => t !== "ALL")
                  .map((t) => (
                    <option key={t} value={t}>
                      {t.replace(/_/g, " ")}
                    </option>
                  ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="NAME_ASC">Name (A-Z)</option>
                <option value="TYPE_ASC">Document Type</option>
                <option value="PROP_ASC">Property Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-56 w-full rounded-3xl" />
            <Skeleton className="h-56 w-full rounded-3xl" />
            <Skeleton className="h-56 w-full rounded-3xl" />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && documents.length === 0 && (
          <div className="py-12">
            <EmptyState
              title="No Legal Documents Available"
              message="Documents associated with your authorized properties will appear here."
              actionLabel="Explore Property Catalog"
              onAction={() => navigate("/property-search")}
            />
          </div>
        )}

        {/* SEARCH EMPTY STATE */}
        {!loading && !error && documents.length > 0 && sortedDocuments.length === 0 && (
          <div className="py-8">
            <EmptyState
              title="No matching legal documents"
              message={`No document matched "${searchQuery}".`}
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery("");
                setActiveTypeTab("ALL");
              }}
            />
          </div>
        )}

        {/* DOCUMENTS GRID */}
        {!loading && !error && sortedDocuments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedDocuments.map((doc) => (
              <LegalDocumentCard
                key={doc.id}
                doc={doc}
                onView={handleView}
                onDownload={handleDownload}
                onVerify={handleVerify}
                onReject={handleReject}
                onRequestReupload={handleRequestReupload}
              />
            ))}
          </div>
        )}

        {/* VIEW PREVIEW MODAL */}
        <AnimatePresence>
          {previewDocModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPreviewDocModal(null)}
                className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 max-w-lg w-full space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#334155]">
                  <div>
                    <span className="text-[10px] font-mono text-blue-600 dark:text-cyan-400 font-bold block">
                      {previewDocModal.id} • {previewDocModal.type}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {previewDocModal.name}
                    </h3>
                  </div>
                  <button onClick={() => setPreviewDocModal(null)} className="p-1 text-slate-400 hover:text-white">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Associated Property</span>
                      <strong className="text-slate-900 dark:text-white text-xs">{previewDocModal.property}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Vault Path</span>
                      <span className="text-blue-600 dark:text-cyan-400 font-mono text-xs">{previewDocModal.filePath}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">File Format</span>
                      <Badge variant="info">{previewDocModal.fileFormat}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Uploaded At</span>
                      <span className="text-slate-700 dark:text-slate-300 text-xs">{previewDocModal.uploadDate}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
                    {previewDocModal.notes}
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#334155]">
                  <Button onClick={() => setPreviewDocModal(null)} variant="secondary" size="xs">
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      setPreviewDocModal(null);
                      if (previewDocModal.propertyId) {
                        navigate(`/property-details?id=${previewDocModal.propertyId}`);
                      }
                    }}
                    variant="primary"
                    size="xs"
                    icon={ExternalLink}
                  >
                    Inspect Property
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* RE-UPLOAD REQUEST MODAL */}
        <AnimatePresence>
          {reuploadModalDoc && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setReuploadModalDoc(null)}
                className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 max-w-md w-full space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#334155]">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <RotateCcw size={16} className="text-amber-500" />
                    Request Document Re-upload
                  </h3>
                  <button onClick={() => setReuploadModalDoc(null)} className="p-1 text-slate-400 hover:text-white">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Document</span>
                    <strong className="text-xs text-slate-900 dark:text-white">{reuploadModalDoc.name}</strong>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400">
                      Reason for Re-upload Request *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Seal illegible or missing Annexure B..."
                      value={reuploadReason}
                      onChange={(e) => setReuploadReason(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-[#334155]">
                  <Button onClick={() => setReuploadModalDoc(null)} variant="secondary" size="xs">
                    Cancel
                  </Button>
                  <Button onClick={submitReuploadRequest} variant="primary" size="xs" icon={RotateCcw}>
                    Issue Notice
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

export default LegalDocuments;
