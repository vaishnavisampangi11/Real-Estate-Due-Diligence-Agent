import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Eye,
  FileDown,
  Share2,
  Archive,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Building2,
  Receipt,
  TrendingUp,
  X,
  Copy,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";
import { exportToPdf } from "../utils/exportUtils";
import { showSuccessAlert, showToast } from "../utils/swal";
import { getAllProperties } from "../services/propertyService";

function FinancialReports() {
  const navigate = useNavigate();

  // State Management
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("NEWEST");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Modals state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedShareReport, setSelectedShareReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllProperties(0, 50);
        const list = res?.content || (Array.isArray(res) ? res : res?.data?.content || []);
        
        const reportCategories = [
          { name: "Loan Evaluation Reports", key: "LOAN" },
          { name: "Property Valuation Reports", key: "VALUATION" },
          { name: "Tax Reports", key: "TAX" },
          { name: "Investment Reports", key: "INVESTMENT" },
        ];

        const applicants = [
          "Adani Realty Institutional Fund",
          "DLF Cybercity Developers Ltd",
          "GMR Logistics Infrastructure",
          "Prestige Capital Partners",
          "Sobha Real Estate Fund",
        ];

        const formatted = list.map((p, idx) => {
          const pId = p.propertyId || p.id || idx + 1;
          const pName = p.propertyName || p.title || `Property Parcel PR-${pId}`;
          const pCode = p.propertyCode || `PR-${pId}`;
          const cat = reportCategories[idx % reportCategories.length];

          return {
            id: `RPT-${cat.key}-2026-${String(pId).padStart(3, "0")}`,
            category: cat.name,
            categoryKey: cat.key,
            property: `${pName} (${pCode})`,
            propertyId: pId.toString(),
            applicant: applicants[idx % applicants.length],
            generatedDate: "05 Aug 2026",
            status: p.status === "VERIFIED" ? "Finalized" : "Under Audit",
            score: p.status === "VERIFIED" ? "94/100 AAA Rating" : "75/100 AA Rating",
            fileSize: "2.4 MB",
          };
        });

        setReports(formatted);
      } catch (err) {
        console.error("Failed to load financial reports:", err);
        setError("Unable to load reports. Please verify backend is running on port 8081.");
        setReports([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // CATEGORY TABS CONFIG
  const categories = [
    { id: "ALL", label: "All Reports", icon: FileSpreadsheet },
    { id: "Loan Evaluation Reports", label: "Loan Evaluation Reports", icon: Landmark },
    { id: "Property Valuation Reports", label: "Property Valuation Reports", icon: Building2 },
    { id: "Tax Reports", label: "Tax Reports", icon: Receipt },
    { id: "Investment Reports", label: "Investment Reports", icon: TrendingUp },
  ];

  // FILTERED & SORTED REPORTS
  const processedReports = useMemo(() => {
    let list = reports.filter((rpt) => {
      const matchCat = activeCategory === "ALL" || rpt.category === activeCategory;
      const matchSearch =
        rpt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpt.property.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpt.applicant.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpt.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpt.status.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch;
    });

    if (sortBy === "NEWEST") {
      list.sort((a, b) => new Date(b.generatedDate) - new Date(a.generatedDate));
    } else if (sortBy === "OLDEST") {
      list.sort((a, b) => new Date(a.generatedDate) - new Date(b.generatedDate));
    } else if (sortBy === "ID_ASC") {
      list.sort((a, b) => a.id.localeCompare(b.id));
    }

    return list;
  }, [reports, activeCategory, searchQuery, sortBy]);

  // PAGINATION CALCULATIONS
  const totalPages = Math.ceil(processedReports.length / pageSize) || 1;
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedReports.slice(start, start + pageSize);
  }, [processedReports, currentPage, pageSize]);

  // THE 4 REQUIRED BUTTON HANDLERS
  // 1. Preview
  const handlePreview = (rpt) => {
    setSelectedReport(rpt);
    setPreviewModalOpen(true);
  };

  // 2. Download PDF
  const handleDownloadPdf = (rpt) => {
    exportToPdf(rpt.id, rpt);
    showSuccessAlert("PDF Report Downloaded", `Downloaded institutional PDF report ${rpt.id}`);
  };

  // 3. Share - Opens Interactive Share Modal
  const handleShare = (rpt) => {
    setSelectedShareReport(rpt);
    setShareModalOpen(true);
  };

  // 4. Archive
  const handleArchive = (id) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Archived" } : r))
    );
    showSuccessAlert("Report Archived", `Report ${id} has been moved to institutional archive.`);
  };

  // Helper for Status Badge Variant
  const getStatusVariant = (status) => {
    switch (status) {
      case "Finalized": return "success";
      case "Under Audit": return "warning";
      case "Archived": return "secondary";
      default: return "info";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-blue-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Financial Underwriting Reports Dossier
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-800">
            TOTAL REPORTS • {processedReports.length} ITEMS
          </span>
        </div>

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold mb-2">
              <FileSpreadsheet size={14} /> Institutional Audit Repository
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              📄 Financial Reports & Certification
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              Inspect Loan Evaluation Reports, Property Valuation Reports, Municipal Tax Clearance Reports, and Investment Performance Reports.
            </p>
          </div>
        </div>

        {/* 4 DISPLAY CATEGORIES TABS */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-[#0F172A] p-2 rounded-2xl border border-slate-200 dark:border-[#334155]">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer font-bold ${
                  active
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* CONTROLS BAR: SEARCH & SORT */}
        <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by Report ID, Property, Applicant, Category, or Status..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] font-bold text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#0F172A] px-3 py-2 rounded-xl border border-slate-200 dark:border-[#334155]">
            <ArrowUpDown size={14} className="text-slate-400 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-900 dark:text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="NEWEST">Sort: Newest First</option>
              <option value="OLDEST">Sort: Oldest First</option>
              <option value="ID_ASC">Sort: Report ID (A-Z)</option>
            </select>
          </div>
        </div>

        {/* ENTERPRISE DATA TABLE COVERING ALL 5 DATA FIELDS & 4 BUTTONS */}
        {paginatedReports.length === 0 ? (
          <EmptyState title="No financial reports found" message="No report matches your search query or selected category filter." />
        ) : (
          <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                📄 Institutional Audit Reports Registry
              </h2>
              <span className="text-slate-400 font-bold">Showing {paginatedReports.length} of {processedReports.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#334155] text-slate-400 uppercase text-[10px] font-bold">
                    <th className="py-3 px-4">1. Report ID</th>
                    <th className="py-3 px-4">2. Property</th>
                    <th className="py-3 px-4">3. Applicant</th>
                    <th className="py-3 px-4">4. Generated Date</th>
                    <th className="py-3 px-4">5. Status</th>
                    <th className="py-3 px-4 text-right">Actions (Preview, PDF, Share, Archive)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#334155]/60 font-medium">
                  {paginatedReports.map((rpt) => (
                    <tr key={rpt.id} className="hover:bg-slate-50 dark:hover:bg-[#0F172A] transition-colors">
                      {/* 1. Report ID */}
                      <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-cyan-400">
                        <div>{rpt.id}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{rpt.category}</span>
                      </td>

                      {/* 2. Property */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{rpt.property}</td>

                      {/* 3. Applicant */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{rpt.applicant}</td>

                      {/* 4. Generated Date */}
                      <td className="py-3.5 px-4 text-slate-400">{rpt.generatedDate}</td>

                      {/* 5. Status */}
                      <td className="py-3.5 px-4">
                        <Badge variant={getStatusVariant(rpt.status)}>{rpt.status}</Badge>
                      </td>

                      {/* 4 REQUIRED BUTTONS: Preview, Download PDF, Share, Archive */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Preview */}
                          <button
                            onClick={() => handlePreview(rpt)}
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-600 dark:text-cyan-300 transition-all cursor-pointer"
                            title="Preview Report"
                          >
                            <Eye size={14} />
                          </button>

                          {/* 2. Download PDF */}
                          <button
                            onClick={() => handleDownloadPdf(rpt)}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-300 transition-all cursor-pointer"
                            title="Download PDF Report"
                          >
                            <FileDown size={14} />
                          </button>

                          {/* 3. Share */}
                          <button
                            onClick={() => handleShare(rpt)}
                            className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 text-purple-600 dark:text-purple-300 transition-all cursor-pointer"
                            title="Share Report Link"
                          >
                            <Share2 size={14} />
                          </button>

                          {/* 4. Archive */}
                          {rpt.status !== "Archived" && (
                            <button
                              onClick={() => handleArchive(rpt.id)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                              title="Archive Report"
                            >
                              <Archive size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ENTERPRISE PAGINATION CONTROLS */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 dark:border-[#334155] pt-4 font-mono text-xs">
              <span className="text-slate-500 font-bold">
                Page {currentPage} of {totalPages} ({processedReports.length} Total Reports)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                >
                  Previous
                </Button>

                <Button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  variant="secondary"
                  size="sm"
                  icon={ChevronRight}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: PREVIEW REPORT MODAL */}
        <AnimatePresence>
          {previewModalOpen && selectedReport && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewModalOpen(false)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6 font-mono text-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye size={20} className="text-blue-500" /> Report Dossier Preview
                  </h2>
                  <button onClick={() => setPreviewModalOpen(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <div className="space-y-3 font-mono">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                    <p className="text-slate-500">Report Ref: <strong className="text-blue-600 dark:text-cyan-400">{selectedReport.id}</strong></p>
                    <p className="text-slate-500">Category: <strong className="text-slate-900 dark:text-white">{selectedReport.category}</strong></p>
                    <p className="text-slate-500">Property: <strong className="text-slate-900 dark:text-white">{selectedReport.property}</strong></p>
                    <p className="text-slate-500">Applicant: <strong className="text-slate-900 dark:text-white">{selectedReport.applicant}</strong></p>
                    <p className="text-slate-500">Generated Date: <strong className="text-slate-400">{selectedReport.generatedDate}</strong></p>
                    <p className="text-slate-500">Score / Verdict: <strong className="text-emerald-600 dark:text-emerald-400">{selectedReport.score}</strong></p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                    <Button onClick={() => setPreviewModalOpen(false)} variant="secondary" size="sm">Close</Button>
                    <Button onClick={() => { setPreviewModalOpen(false); handleDownloadPdf(selectedReport); }} variant="primary" size="sm" icon={FileDown}>Download PDF</Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MODAL 2: INTERACTIVE SHARE REPORT MODAL */}
        <AnimatePresence>
          {shareModalOpen && selectedShareReport && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShareModalOpen(false)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6 font-mono text-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Share2 size={20} className="text-purple-500" /> Share Financial Report
                  </h2>
                  <button onClick={() => setShareModalOpen(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <div className="space-y-4 font-mono">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                    <p className="text-slate-500">Report Ref: <strong className="text-blue-600 dark:text-cyan-400">{selectedShareReport.id}</strong></p>
                    <p className="text-slate-500">Property: <strong className="text-slate-900 dark:text-white">{selectedShareReport.property}</strong></p>
                  </div>

                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Direct Access Link</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/due-diligence-report?id=${selectedShareReport.propertyId || '1001'}`}
                        className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-blue-600 dark:text-cyan-400 font-bold"
                      />
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/due-diligence-report?id=${selectedShareReport.propertyId || '1001'}`;
                          navigator.clipboard.writeText(url);
                          showToast("Direct access link copied to clipboard!", "success");
                        }}
                        className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                        title="Copy to Clipboard"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/due-diligence-report?id=${selectedShareReport.propertyId || '1001'}`;
                        window.open(url, "_blank");
                        setShareModalOpen(false);
                      }}
                      className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Eye size={14} /> Open in New Tab
                    </button>

                    <button
                      onClick={() => {
                        const url = `${window.location.origin}/due-diligence-report?id=${selectedShareReport.propertyId || '1001'}`;
                        window.location.href = `mailto:?subject=Financial Audit Report ${selectedShareReport.id}&body=Access the institutional audit report here: ${encodeURIComponent(url)}`;
                        setShareModalOpen(false);
                      }}
                      className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-cyan-300 font-bold border border-blue-200 dark:border-blue-800 text-center cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Share2 size={14} /> Share via Email
                    </button>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end">
                    <Button onClick={() => setShareModalOpen(false)} variant="secondary" size="sm">Close</Button>
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

export default FinancialReports;
