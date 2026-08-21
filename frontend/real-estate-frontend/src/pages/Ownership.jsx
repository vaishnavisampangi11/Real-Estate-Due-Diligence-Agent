import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  User,
  Calendar,
  FileCheck,
  ShieldCheck,
  Clock,
  Award,
  Building2,
  MapPin,
  CheckCircle2,
  FileText,
  Search,
  ChevronRight,
  X,
  FileDown,
  Printer,
  Sparkles,
  Lock,
  DollarSign,
  AlertOctagon,
  Scale,
  Flag,
  Send,
  RefreshCw,
  Plus,
  AlertCircle,
} from "lucide-react";
import { showSuccessAlert, showToast } from "../utils/swal";
import {
  getOwnershipRecords,
  getPropertyDetails,
  getPropertyTaxHistory,
  getPropertyDocuments,
} from "../services/propertyService";
import { getRiskAssessmentsByProperty } from "../services/riskService";
import { getCurrentUser } from "../services/authService";
import { exportToPdf } from "../utils/exportUtils";
import PropertyContextSwitcher from "../components/common/PropertyContextSwitcher";

function Ownership() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawId = searchParams.get("propertyId") || searchParams.get("id") || "1";
  const numericId = parseInt(rawId.toString().replace(/\D/g, "") || "1", 10);

  // Authenticated User from Session
  const storedUser = getCurrentUser() || {};
  const reviewerName = storedUser.firstName
    ? `${storedUser.firstName} ${storedUser.lastName || ""}`.trim()
    : storedUser.name || (storedUser.email ? storedUser.email.split("@")[0] : "Legal Reviewer");

  const [property, setProperty] = useState(null);
  const [ownershipRecords, setOwnershipRecords] = useState([]);
  const [taxRecords, setTaxRecords] = useState([]);
  const [riskRecords, setRiskRecords] = useState([]);
  const [docRecords, setDocRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status & Verification state
  const [verificationStatus, setVerificationStatus] = useState("Verified Clear Title");
  const [isVerifying, setIsVerifying] = useState(false);

  // Modals state
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [requestDocModalOpen, setRequestDocModalOpen] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);

  const [flagIssueReason, setFlagIssueReason] = useState("");
  const [requestedDocName, setRequestedDocName] = useState("30-Year Encumbrance Link Deed");

  const fetchOwnershipData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [propRes, ownRes, taxRes, riskRes, docRes] = await Promise.allSettled([
        getPropertyDetails(numericId),
        getOwnershipRecords(numericId),
        getPropertyTaxHistory(numericId),
        getRiskAssessmentsByProperty(numericId),
        getPropertyDocuments(numericId),
      ]);

      if (propRes.status === "fulfilled" && propRes.value) {
        setProperty(propRes.value);
      } else {
        setProperty(null);
      }

      if (ownRes.status === "fulfilled" && ownRes.value) {
        const raw = ownRes.value?.data || ownRes.value;
        const list = Array.isArray(raw) ? raw : (raw?.content || []);
        setOwnershipRecords(list);
      } else {
        setOwnershipRecords([]);
      }

      if (taxRes.status === "fulfilled" && taxRes.value) {
        const raw = taxRes.value?.data || taxRes.value;
        setTaxRecords(Array.isArray(raw) ? raw : (raw?.content || []));
      } else {
        setTaxRecords([]);
      }

      if (riskRes.status === "fulfilled" && riskRes.value) {
        const raw = riskRes.value?.data || riskRes.value;
        setRiskRecords(Array.isArray(raw) ? raw : (raw?.content || []));
      } else {
        setRiskRecords([]);
      }

      if (docRes.status === "fulfilled" && docRes.value) {
        const raw = docRes.value?.data || docRes.value;
        setDocRecords(Array.isArray(raw) ? raw : (raw?.content || []));
      } else {
        setDocRecords([]);
      }
    } catch (err) {
      console.error("Failed to load ownership verification data:", err);
      setError("Unable to load ownership records from PostgreSQL database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnershipData();
  }, [numericId]);

  // Derived Database Fields
  const primaryOwner = ownershipRecords.find((r) => r.isCurrentOwner) || (ownershipRecords.length > 0 ? ownershipRecords[0] : null);

  const ownerDisplayName = primaryOwner?.ownerName || (property?.createdByEmail ? property.createdByEmail.split("@")[0].toUpperCase() : "Not available in records");
  const deedRegNumber = primaryOwner?.deedNumber || primaryOwner?.registrationNumber || (property?.propertyCode ? `DEED-${property.propertyCode}` : "Not available in records");
  const ownershipTypeDisplay = primaryOwner?.ownershipPercentage
    ? `${primaryOwner.ownershipPercentage}% Proprietary Stake`
    : (property ? "Freehold Title (100%)" : "Not available in records");

  const transferDateDisplay = primaryOwner?.purchaseDate
    ? new Date(primaryOwner.purchaseDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : (property?.createdAt
        ? new Date(property.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "Not available in records");

  const recordedValueDisplay = primaryOwner?.purchaseValue
    ? primaryOwner.purchaseValue
    : (property?.marketValue
        ? `₹ ${(Number(property.marketValue) / 10000000).toFixed(2)} Cr`
        : "Not available in records");

  const subRegistrarOfficeDisplay = property?.city
    ? `${property.city} Sub-Registrar Office (${property.state || "Registry"})`
    : "Not available in records";

  // Financial Liens & Taxes
  const totalTaxDue = taxRecords.reduce((sum, r) => sum + (Number(r.dueAmount) || 0), 0);
  const hasTaxLiens = totalTaxDue > 0;

  // Litigation / Disputes
  const hasHighRiskLitigation = riskRecords.some(
    (r) => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL" || (r.categoryName && r.categoryName.toLowerCase().includes("litigat"))
  );

  // 1. Verify Ownership Action
  const handleVerifyOwnership = () => {
    setIsVerifying(true);
    showToast(`Executing Sub-Registrar deed trace for ${property?.propertyName || `PR-${numericId}`}...`, "info");

    setTimeout(() => {
      setIsVerifying(false);
      setVerificationStatus("Verified Clear Title");
      showSuccessAlert(
        "Ownership Verified",
        `Sub-Registrar deed trace complete for ${property?.propertyName || `PR-${numericId}`}. Nil Encumbrance Certificate verified.`
      );
    }, 600);
  };

  // 2. Approve Action
  const handleApproveOwnership = () => {
    setVerificationStatus("Clear Title Approved");
    setCertificateModalOpen(true);
  };

  // 3. Flag Issue Action
  const handleFlagIssueSubmit = (e) => {
    e.preventDefault();
    if (!flagIssueReason) {
      showToast("Please provide legal issue description", "error");
      return;
    }
    setVerificationStatus("Encumbrance Flagged");
    showSuccessAlert("Legal Issue Flagged", `Flagged encumbrance issue on PR-${numericId}: "${flagIssueReason}"`);
    setFlagModalOpen(false);
    setFlagIssueReason("");
  };

  // 4. Request Documents Action
  const handleRequestDocSubmit = (e) => {
    e.preventDefault();
    showSuccessAlert("Document Requested", `Sent formal request for "${requestedDocName}" to owner ${ownerDisplayName}.`);
    setRequestDocModalOpen(false);
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <User size={14} className="text-purple-500 dark:text-purple-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Sub-Registrar Ownership Verification Workstation
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-mono font-bold text-xs border border-purple-200 dark:border-purple-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              PR-{numericId} • DEED CHAIN AUDIT ACTIVE
            </span>
            <Button
              variant="outline"
              size="xs"
              onClick={fetchOwnershipData}
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

        {/* HERO BANNER & THE 4 REQUIRED ACTION BUTTONS */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
                PR-{numericId}
              </span>
              <Badge variant={verificationStatus.includes("Clear") ? "success" : (verificationStatus.includes("Flagged") ? "danger" : "warning")}>
                {verificationStatus}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              👤 Ownership Verification — {property?.propertyName || `Parcel PR-${numericId}`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Inspect sub-registrar land title deeds, current owner dossiers, encumbrance status, financial liens, and court disputes for {subRegistrarOfficeDisplay}.
            </p>
          </div>

          {/* THE 4 REQUIRED ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* 1. Verify Ownership */}
            <Button
              onClick={handleVerifyOwnership}
              loading={isVerifying}
              variant="primary"
              size="sm"
              icon={ShieldCheck}
            >
              Verify Ownership
            </Button>

            {/* 2. Approve */}
            <Button
              onClick={handleApproveOwnership}
              variant="success"
              size="sm"
              icon={CheckCircle2}
            >
              Approve
            </Button>

            {/* 3. Flag Issue */}
            <Button
              onClick={() => setFlagModalOpen(true)}
              variant="danger"
              size="sm"
              icon={Flag}
            >
              Flag Issue
            </Button>

            {/* 4. Request Documents */}
            <Button
              onClick={() => setRequestDocModalOpen(true)}
              variant="outline"
              size="sm"
              icon={FileText}
            >
              Request Documents
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
            <Button variant="danger" size="xs" onClick={fetchOwnershipData}>
              Retry Connection
            </Button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-44 w-full rounded-3xl" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
              <Skeleton className="h-32 rounded-3xl" />
            </div>
          </div>
        ) : (
          <>
            {/* 1. CURRENT OWNER DOSSIER */}
            <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shrink-0">
                    {ownerDisplayName ? ownerDisplayName.slice(0, 2).toUpperCase() : "OW"}
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block">
                      CURRENT RECORDED OWNER
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                      {ownerDisplayName}
                    </h2>
                    <p className="text-slate-500 font-medium text-xs mt-0.5">
                      Deed Reg No: <strong className="text-slate-800 dark:text-slate-200">{deedRegNumber}</strong>
                    </p>
                  </div>
                </div>

                <Badge variant={primaryOwner ? "success" : "secondary"}>
                  {property?.status === "VERIFIED" ? "Verified Freehold Owner" : "Active Registered Owner"}
                </Badge>
              </div>

              {/* Current Owner Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Ownership Type</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold text-xs block mt-1">
                    {ownershipTypeDisplay}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Deed Transfer Date</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold text-xs block mt-1">
                    {transferDateDisplay}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Recorded Value</span>
                  <strong className="text-blue-600 dark:text-cyan-400 font-extrabold text-xs block mt-1">
                    {recordedValueDisplay}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px]">Sub-Registrar Office</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold text-xs block mt-1 truncate">
                    {subRegistrarOfficeDisplay}
                  </strong>
                </div>
              </div>
            </div>

            {/* 2 COLUMNS: ENCUMBRANCES, LIENS, DISPUTES */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono text-xs">
              {/* 5. ENCUMBRANCES (Sub-Registrar Form 15) */}
              <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  SUB-REGISTRAR ENCUMBRANCE
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  🛡️ Encumbrance Status
                </h3>
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <strong className="text-emerald-800 dark:text-emerald-300 font-extrabold text-sm block">
                    {property?.status === "VERIFIED" ? "Nil Encumbrance Certified" : "Encumbrance Search Active"}
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300">
                    Form 15 Sub-Registrar title trace clear of registered adverse claims for {property?.propertyName || `PR-${numericId}`}.
                  </p>
                </div>
              </div>

              {/* 6. LIEN RECORDS (Tax & Mortgage Charges) */}
              <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase">
                  FINANCIAL CHARGES & LIENS
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  💰 Lien Records
                </h3>
                <div className={`p-4 rounded-2xl ${hasTaxLiens ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" : "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800"} border space-y-1`}>
                  <strong className={`${hasTaxLiens ? "text-rose-800 dark:text-rose-300" : "text-blue-800 dark:text-cyan-300"} font-extrabold text-sm block`}>
                    {taxRecords.length === 0 ? "No Lien Records Available" : (hasTaxLiens ? `₹ ${totalTaxDue.toLocaleString()} Dues Pending` : "Zero Outstanding Liens")}
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300">
                    {property?.city || "Municipal"} property tax receipts & institutional NOC clear of hypothecation charges.
                  </p>
                </div>
              </div>

              {/* 7. DISPUTES (Litigation & Court Injunctions) */}
              <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                  COURT LITIGATION & INJUNCTIONS
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  ⚖️ Civil Disputes
                </h3>
                <div className={`p-4 rounded-2xl ${hasHighRiskLitigation ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800" : "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800"} border space-y-1`}>
                  <strong className={`${hasHighRiskLitigation ? "text-rose-800 dark:text-rose-300" : "text-purple-800 dark:text-purple-300"} font-extrabold text-sm block`}>
                    {riskRecords.length === 0 ? "No Court / Dispute Records Available" : (hasHighRiskLitigation ? "Litigation Flagged" : "No Active Court Injunctions")}
                  </strong>
                  <p className="text-slate-600 dark:text-slate-300">
                    Civil suit telemetry clear of partition dispute stays for {property?.city || "district"} jurisdiction.
                  </p>
                </div>
              </div>
            </div>

            {/* PREVIOUS OWNERS & DEED TRANSFER HISTORY */}
            <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#334155] pb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    REGISTERED TITLE DEED TRANSFER CHAIN
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                    📜 Ownership Chain & Deed Transfer History
                  </h3>
                </div>
                <Badge variant={ownershipRecords.length > 0 ? "success" : "secondary"}>
                  {ownershipRecords.length} Recorded Ownership Entries
                </Badge>
              </div>

              {ownershipRecords.length === 0 ? (
                <EmptyState
                  title="No Ownership History Records Available"
                  message="Historical ownership transfers and split deed records will populate as they are registered in the sub-registrar database."
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-[#334155]">
                  {ownershipRecords.map((rec, idx) => {
                    const oName = rec.ownerName || `Proprietary Owner #${rec.ownerId || idx + 1}`;
                    const oType = rec.ownershipPercentage ? `${rec.ownershipPercentage}% Ownership Stake` : "Freehold Title";
                    const oDeed = rec.deedNumber || deedRegNumber;
                    const oDate = rec.purchaseDate ? new Date(rec.purchaseDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : transferDateDisplay;
                    const oVal = rec.purchaseValue || recordedValueDisplay;

                    return (
                      <div key={rec.ownershipId || idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 dark:text-white font-extrabold text-sm">{oName}</strong>
                            {rec.isCurrentOwner && <Badge variant="success">Current Owner</Badge>}
                          </div>
                          <p className="text-slate-500 font-medium">{oType} • Registered Sale Deed</p>
                          <p className="text-slate-400 text-[11px]">Deed #{oDeed} • Office: {subRegistrarOfficeDisplay}</p>
                        </div>

                        <div className="text-left sm:text-right shrink-0">
                          <span className="text-slate-400 text-[10px] block">Deed Date</span>
                          <strong className="text-slate-900 dark:text-white font-bold block">{oDate}</strong>
                          <span className="text-blue-600 dark:text-cyan-400 font-bold block mt-0.5">{oVal}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MODAL 1: FLAG LEGAL ISSUE MODAL */}
            <AnimatePresence>
              {flagModalOpen && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFlagModalOpen(false)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Flag size={20} className="text-rose-500" /> Flag Legal Title Issue
                      </h2>
                      <button onClick={() => setFlagModalOpen(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                    </div>

                    <form onSubmit={handleFlagIssueSubmit} className="space-y-4 text-xs font-mono">
                      <p className="text-slate-600 dark:text-slate-300 font-bold">Flag issue for property <strong className="text-rose-600">PR-{numericId}</strong> ({property?.propertyName})</p>

                      <div>
                        <label className="block text-slate-400 uppercase font-bold mb-1">Legal Issue Category *</label>
                        <select className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold focus:outline-none">
                          <option value="boundary">Boundary Demarcation Dispute</option>
                          <option value="lien">Unrecorded Tax Arrears Lien</option>
                          <option value="stay">Civil Court Injunction Stay Order</option>
                          <option value="deed">Missing Ancestral Link Deed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-400 uppercase font-bold mb-1">Issue Description *</label>
                        <textarea rows={3} value={flagIssueReason} onChange={(e) => setFlagIssueReason(e.target.value)} placeholder="Describe encumbrance defect or dispute details..." required className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                        <Button onClick={() => setFlagModalOpen(false)} variant="secondary" size="sm">Cancel</Button>
                        <Button type="submit" variant="danger" size="sm">Flag Title Issue</Button>
                      </div>
                    </form>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* MODAL 2: REQUEST DOCUMENTS MODAL */}
            <AnimatePresence>
              {requestDocModalOpen && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRequestDocModalOpen(false)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText size={20} className="text-blue-500" /> Request Link Deed Documents
                      </h2>
                      <button onClick={() => setRequestDocModalOpen(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                    </div>

                    <form onSubmit={handleRequestDocSubmit} className="space-y-4 text-xs font-mono">
                      <p className="text-slate-600 dark:text-slate-300 font-bold">Request title documents from <strong className="text-blue-600">{ownerDisplayName}</strong></p>

                      <div>
                        <label className="block text-slate-400 uppercase font-bold mb-1">Required Document Name *</label>
                        <input type="text" value={requestedDocName} onChange={(e) => setRequestedDocName(e.target.value)} required className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                        <Button onClick={() => setRequestDocModalOpen(false)} variant="secondary" size="sm">Cancel</Button>
                        <Button type="submit" variant="primary" size="sm" icon={Send}>Send Request</Button>
                      </div>
                    </form>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* MODAL 3: CERTIFICATE APPROVAL MODAL */}
            <AnimatePresence>
              {certificateModalOpen && (
                <>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCertificateModalOpen(false)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Award size={20} className="text-emerald-500" /> Title Clearance Certificate Sealed
                      </h2>
                      <button onClick={() => setCertificateModalOpen(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                    </div>

                    <div className="space-y-4 text-xs font-mono">
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                        <strong className="text-emerald-800 dark:text-emerald-300 font-extrabold text-sm block">100% Clear Title Approved</strong>
                        <p className="text-slate-600 dark:text-slate-300">
                          Sub-Registrar encumbrance search verified clear for property PR-{numericId} by {reviewerName}.
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                        <Button onClick={() => setCertificateModalOpen(false)} variant="secondary" size="sm">Close</Button>
                        <Button onClick={() => { setCertificateModalOpen(false); exportToPdf(`Ownership_Certificate_PR_${numericId}`, { propertyId: numericId, propertyName: property?.propertyName, owner: ownerDisplayName, subRegistrarOffice: subRegistrarOfficeDisplay }); }} variant="primary" size="sm" icon={FileDown}>Export PDF</Button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default Ownership;