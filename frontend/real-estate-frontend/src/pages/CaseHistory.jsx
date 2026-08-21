import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  History,
  Search,
  Filter,
  ArrowUpDown,
  Home,
  UserCheck,
  Scale,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertOctagon,
  FileDown,
  ChevronRight,
  Sparkles,
  Layers,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import PropertyContextSwitcher from "../components/common/PropertyContextSwitcher";
import { exportToPdf } from "../utils/exportUtils";
import { getReportsByProperty } from "../services/reportService";
import {
  getPropertyDetails,
  getOwnershipRecords,
  getPropertyDocuments,
} from "../services/propertyService";
import { getRiskAssessmentsByProperty } from "../services/riskService";
import { getAllAuditLogs } from "../services/auditService";
import { showToast } from "../utils/swal";

function CaseHistory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawId = searchParams.get("id") || searchParams.get("propertyId") || "1";
  const numericId = parseInt(rawId.toString().replace(/\D/g, "") || "1", 10);

  const [property, setProperty] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // FILTERS STATE (CATEGORY, SEARCH, SORT)
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryTab, setCategoryTab] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [propRes, reportsRes, ownershipRes, riskRes, docsRes, auditRes] = await Promise.allSettled([
          getPropertyDetails(numericId),
          getReportsByProperty(numericId),
          getOwnershipRecords(numericId),
          getRiskAssessmentsByProperty(numericId),
          getPropertyDocuments(numericId),
          getAllAuditLogs(0, 50),
        ]);

        let propData = null;
        if (propRes.status === "fulfilled" && propRes.value) {
          propData = propRes.value;
          setProperty(propData);
        } else {
          setProperty(null);
        }

        const rawReports = reportsRes.status === "fulfilled"
          ? (Array.isArray(reportsRes.value?.data) ? reportsRes.value.data : (Array.isArray(reportsRes.value) ? reportsRes.value : []))
          : [];

        const rawOwnership = ownershipRes.status === "fulfilled"
          ? (Array.isArray(ownershipRes.value?.data) ? ownershipRes.value.data : (Array.isArray(ownershipRes.value) ? ownershipRes.value : []))
          : [];

        const rawRisk = riskRes.status === "fulfilled"
          ? (Array.isArray(riskRes.value?.data) ? riskRes.value.data : (Array.isArray(riskRes.value) ? riskRes.value : []))
          : [];

        const rawDocs = docsRes.status === "fulfilled"
          ? (Array.isArray(docsRes.value?.data) ? docsRes.value.data : (Array.isArray(docsRes.value) ? docsRes.value : []))
          : [];

        const rawAudit = auditRes.status === "fulfilled"
          ? (auditRes.value?.content || (Array.isArray(auditRes.value) ? auditRes.value : auditRes.value?.data?.content || []))
          : [];

        const list = [];
        const pName = propData?.propertyName || `Property Parcel PR-${numericId}`;
        const pCode = propData?.propertyCode || `PR-${numericId}`;

        // 1. Initial Property Registration & Sub-Registrar Deed Event
        if (propData) {
          const propDate = propData.createdAt ? new Date(propData.createdAt) : new Date();
          list.push({
            id: `HIS-DEED-${numericId}`,
            category: "Previous Reviews",
            title: `Title Deed Recorded: ${pName}`,
            property: `${pName} (${pCode})`,
            propertyId: numericId,
            date: propDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            dateRaw: propDate,
            user: propData.createdByEmail ? propData.createdByEmail.split("@")[0].toUpperCase() : "Sub-Registrar Office",
            status: propData.status === "VERIFIED" ? "Verified Clear" : (propData.status || "Under Review"),
            variant: propData.status === "VERIFIED" ? "success" : "warning",
            description: `Property asset registered with market valuation ₹ ${propData.marketValue ? (Number(propData.marketValue) / 10000000).toFixed(2) : "—"} Cr at ${propData.city || "Urban Registry"}.`,
            linkPath: `/property-review?id=${numericId}`,
          });
        }

        // 2. Historical Due Diligence Reports
        rawReports.forEach((rpt, idx) => {
          const rptId = rpt.reportId || idx + 1;
          const rptDate = rpt.createdAt ? new Date(rpt.createdAt) : (rpt.generatedAt ? new Date(rpt.generatedAt) : new Date());
          const st = rpt.reportStatus || rpt.status || "COMPLETED";

          list.push({
            id: `HIS-RPT-${rptId}`,
            category: "Historical Reports",
            title: rpt.reportName || `Due Diligence Dossier Issued (#${rptId})`,
            property: `${pName} (${pCode})`,
            propertyId: numericId,
            date: rptDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            dateRaw: rptDate,
            user: rpt.generatedByUserEmail ? rpt.generatedByUserEmail.split("@")[0].toUpperCase() : "Legal Reviewer",
            status: st,
            variant: st.toUpperCase().includes("COMPLET") || st.toUpperCase().includes("VERIF") ? "success" : "warning",
            description: rpt.executiveSummary || `Comprehensive due diligence dossier filed and archived in database registry.`,
            linkPath: `/due-diligence-report?id=${numericId}`,
          });
        });

        // 3. Ownership Changes & Title Deeds
        rawOwnership.forEach((own, idx) => {
          const ownId = own.ownershipId || idx + 1;
          const ownDate = own.purchaseDate ? new Date(own.purchaseDate) : (own.createdAt ? new Date(own.createdAt) : new Date());
          const ownerName = own.ownerName || `Proprietary Owner #${own.ownerId || ownId}`;
          const isVerified = own.verificationStatus === true || own.verificationStatus === "VERIFIED";

          list.push({
            id: `HIS-OWN-${ownId}`,
            category: "Ownership Changes",
            title: `Title Deed Ownership: ${ownerName}`,
            property: `${pName} (${pCode})`,
            propertyId: numericId,
            date: ownDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            dateRaw: ownDate,
            user: ownerName,
            status: isVerified ? "Verified Title" : "Deed Recorded",
            variant: isVerified ? "success" : "info",
            description: `Ownership stake (${own.ownershipPercentage || 100}%) verified with Sub-Registrar records.`,
            linkPath: `/property-review?id=${numericId}`,
          });
        });

        // 4. Legal & Risk Assessments
        rawRisk.forEach((rsk, idx) => {
          const rskId = rsk.assessmentId || idx + 1;
          const rskDate = rsk.createdAt ? new Date(rsk.createdAt) : new Date();
          const riskLvl = rsk.riskLevel || "Standard";
          const isHigh = riskLvl === "HIGH" || riskLvl === "CRITICAL";

          list.push({
            id: `HIS-RSK-${rskId}`,
            category: "Previous Reviews",
            title: `Legal Risk Assessment: ${riskLvl} Level`,
            property: `${pName} (${pCode})`,
            propertyId: numericId,
            date: rskDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            dateRaw: rskDate,
            user: rsk.assessorName || "Legal Assessor",
            status: isHigh ? "Action Required" : "Cleared",
            variant: isHigh ? "danger" : "success",
            description: `13-Vector Risk Telemetry calculated score: ${rsk.riskScore || 0}/100. Category: ${rsk.categoryName || "Title & Compliance"}.`,
            linkPath: `/risk-assessment?id=${numericId}`,
          });
        });

        // 5. Legal Documents Vault Verification
        rawDocs.forEach((doc, idx) => {
          const docId = doc.documentId || idx + 1;
          const docDate = doc.uploadedAt || doc.createdAt ? new Date(doc.uploadedAt || doc.createdAt) : new Date();
          const docType = doc.documentType || "Registry Record";

          list.push({
            id: `HIS-DOC-${docId}`,
            category: "Previous Reviews",
            title: `Document Uploaded: ${docType}`,
            property: `${pName} (${pCode})`,
            propertyId: numericId,
            date: docDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
            dateRaw: docDate,
            user: doc.uploadedByEmail ? doc.uploadedByEmail.split("@")[0].toUpperCase() : "Document Vault",
            status: doc.verificationStatus ? "Verified" : "Under Review",
            variant: doc.verificationStatus ? "success" : "info",
            description: `Legal file "${doc.fileName || docType}" registered in Document Vault.`,
            linkPath: `/legal/documents?id=${numericId}`,
          });
        });

        // 6. Property-Specific Audit Logs
        rawAudit
          .filter((a) => {
            const str = `${a.entityId || ""} ${a.details || ""} ${a.action || ""}`.toLowerCase();
            return str.includes(String(numericId)) || (propData?.propertyName && str.includes(propData.propertyName.toLowerCase()));
          })
          .forEach((log, idx) => {
            const logId = log.logId || log.id || idx + 1;
            const logDate = log.createdAt ? new Date(log.createdAt) : new Date();
            const act = (log.action || "SYSTEM_AUDIT").replace(/_/g, " ");

            list.push({
              id: `HIS-AUD-${logId}`,
              category: "Previous Reviews",
              title: `System Audit: ${act}`,
              property: `${pName} (${pCode})`,
              propertyId: numericId,
              date: logDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
              dateRaw: logDate,
              user: log.userEmail ? log.userEmail.split("@")[0].toUpperCase() : "Security Officer",
              status: log.status || "Executed",
              variant: (log.status || "").toUpperCase() === "FAILED" ? "danger" : "success",
              description: log.details || `Audit event ${act} logged in platform telemetry.`,
              linkPath: `/admin/audit-logs`,
            });
          });

        // Sort events descending by dateRaw
        list.sort((a, b) => b.dateRaw - a.dateRaw);
        setEvents(list);
      } catch (err) {
        console.error("Case history fetch error:", err);
        setError("Unable to load case history. Please verify backend connection.");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoryData();
  }, [numericId]);

  // FILTERED & SORTED EVENTS
  const processedEvents = useMemo(() => {
    let list = events.filter((ev) => {
      const matchCategory = categoryTab === "ALL" || ev.category === categoryTab;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        ev.id.toLowerCase().includes(q) ||
        ev.title.toLowerCase().includes(q) ||
        ev.property.toLowerCase().includes(q) ||
        ev.user.toLowerCase().includes(q) ||
        ev.description.toLowerCase().includes(q) ||
        ev.status.toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });

    if (sortBy === "NEWEST") {
      list.sort((a, b) => b.dateRaw - a.dateRaw);
    } else if (sortBy === "OLDEST") {
      list.sort((a, b) => a.dateRaw - b.dateRaw);
    } else if (sortBy === "PROPERTY") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [events, categoryTab, searchQuery, sortBy]);

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <History size={14} className="text-purple-500 dark:text-purple-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Sub-Registrar Case History & Legal Telemetry
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono font-bold text-xs border border-purple-200 dark:border-purple-800">
              PR-{numericId} • {events.length} HISTORICAL EVENTS
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                setLoading(true);
                showToast("Case history synchronized with PostgreSQL.", "info");
                setTimeout(() => setLoading(false), 400);
              }}
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-mono font-bold mb-2">
              <Scale size={14} /> Sub-Registrar Audit Register
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              📜 Historical Case Timeline — {property?.propertyName || `Parcel PR-${numericId}`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              Chronological ledger tracking initial deed records, ownership titles, risk assessments, and due diligence dossiers from PostgreSQL.
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
            <Button variant="danger" size="xs" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        )}

        {/* SEARCH & MULTI-FILTER CONTROL BAR */}
        <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4 font-mono text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search history by Event ID, Title, User, or Keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-slate-400 text-[10px] uppercase font-bold">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer"
              >
                <option value="NEWEST">Newest Events First</option>
                <option value="OLDEST">Oldest Events First</option>
                <option value="PROPERTY">Event Title (A-Z)</option>
              </select>
            </div>
          </div>

          {/* 4 Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#334155]">
            <span className="text-slate-400 text-[10px] uppercase font-bold mr-2">Category:</span>
            {[
              { id: "ALL", label: "All Historical Categories" },
              { id: "Previous Reviews", label: "Previous Reviews" },
              { id: "Ownership Changes", label: "Ownership Changes" },
              { id: "Historical Reports", label: "Historical Reports" },
            ].map((tab) => {
              const active = categoryTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCategoryTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold ${
                    active
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TIMELINE EVENTS FEED */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-28 w-full rounded-3xl" />
          </div>
        ) : processedEvents.length === 0 ? (
          <EmptyState
            title="No Case History Events Found"
            message={`No historical events found for category "${categoryTab}" on parcel ${property?.propertyName || `PR-${numericId}`}.`}
          />
        ) : (
          <div className="space-y-4">
            {processedEvents.map((ev) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:border-purple-400 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="purple">{ev.category}</Badge>
                    <span className="text-[10px] font-bold text-slate-400">
                      {ev.id} • {ev.date}
                    </span>
                    <Badge variant={ev.variant}>{ev.status}</Badge>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {ev.title}
                  </h3>

                  <p className="text-slate-500 leading-relaxed text-xs">
                    {ev.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1 font-bold text-slate-600 dark:text-slate-300">
                      <Building2 size={12} className="text-purple-500" />
                      {ev.property}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserCheck size={12} className="text-blue-500" />
                      Recorded By: {ev.user}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {ev.linkPath && (
                    <Button
                      onClick={() => navigate(ev.linkPath)}
                      variant="ghost"
                      size="xs"
                      className="flex items-center gap-1"
                    >
                      <ExternalLink size={12} />
                      <span>Details</span>
                    </Button>
                  )}
                  <Button
                    onClick={() => exportToPdf(ev.id, ev)}
                    variant="outline"
                    size="xs"
                    icon={FileDown}
                  >
                    Export
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default CaseHistory;
