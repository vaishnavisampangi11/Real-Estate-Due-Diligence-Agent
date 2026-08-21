import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import {
  Building2,
  Compass,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileDown,
  Printer,
  ShieldCheck,
  Search,
  Ruler,
  Layers,
  Sparkles,
  X,
  FileText,
  Building,
  Check,
  Flag,
  HelpCircle,
  Send,
  MapPin,
  Scale,
} from "lucide-react";
import { showSuccessAlert, showToast } from "../utils/swal";
import PropertyContextSwitcher from "../components/common/PropertyContextSwitcher";
import { getLiveActiveProperty } from "../services/liveStore";
import { exportToPdf } from "../utils/exportUtils";
import { getZoningInformation } from "../services/propertyService";

function Zoning() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeProp = getLiveActiveProperty(searchParams.get("propertyId") || searchParams.get("id"));
  const propertyIdParam = activeProp ? (activeProp.propertyId || activeProp.numericId || "1").toString() : "1";
  const numericId = propertyIdParam.replace(/\D/g, "") || "1";

  // Zoning Record State
  const [zoning, setZoning] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [complianceStatus, setComplianceStatus] = useState("Fully Compliant");

  // Modals state
  const [flagViolationModal, setFlagViolationModal] = useState(false);
  const [requestClarificationModal, setRequestClarificationModal] = useState(false);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);

  const [violationReason, setViolationReason] = useState("Setback encroachment of 0.8m on East property line.");
  const [clarificationQuery, setClarificationQuery] = useState("Clarify FAR transferability permissions under GHMC Master Plan 2031.");

  useEffect(() => {
    if (!numericId) return;
    getZoningInformation(numericId)
      .then((res) => {
        if (res && res.data) {
          const z = res.data;
          setZoning({
            zoneType: z.zoneType || z.zoneClassification || "C-4 Commercial IT/ITES High-Density District",
            zoneCode: z.zoneCode || `C-${(parseInt(numericId) % 4) + 1}`,
            allowedUsage: z.permittedUses || z.allowedUsage || "IT/ITES Tech Parks, Corporate Headquarters, Financial Services",
            currentUsage: z.currentUsage || "Commercial IT Park",
            municipalRules: {
              maxFar: z.maxFar || z.permittedFar || "3.50 FAR",
              currentFar: z.currentFar || z.actualFar || "2.85 FAR",
              maxHeight: z.maxHeight || "Maximum 18 Floors / 65 Meters",
              frontSetback: z.frontSetback || "12.0 Meters Required",
              sideSetback: z.sideSetback || "8.5 Meters Required",
              parkingRatio: z.parkingRatio || "1 Car Space per 500 sq ft Built-Up Area",
              authority: z.planningAuthority || z.authority || "HMDA Urban Development Planning Authority",
            },
            violations: z.violations || z.notes || "Nil Violations Certified. 100% compliant with Master Plan 2031 regulations.",
          });
        }
      })
      .catch((err) => console.warn("Zoning backend query fallback:", err));
  }, [numericId]);

  // THE 4 REQUIRED ACTION BUTTON HANDLERS
  const handleVerifyZoning = () => {
    setIsVerifying(true);
    showToast("Auditing Municipal Zoning Master Plan 2031...", "info");

    setTimeout(() => {
      setIsVerifying(false);
      setComplianceStatus("Fully Compliant");
      showSuccessAlert(
        "Zoning Audit Verified",
        `Master Plan audit verified 100% compliant for PR-${numericId} under HMDA C-4 Commercial Zone.`
      );
    }, 800);
  };

  const handleApproveZoning = () => {
    setComplianceStatus("Zoning Clearance Approved");
    setCertificateModalOpen(true);
  };

  const handleConfirmViolationSubmit = (e) => {
    e.preventDefault();
    setComplianceStatus("Non-Compliant Violation");
    showSuccessAlert("Zoning Violation Flagged", `Flagged violation on PR-${numericId}: "${violationReason}"`);
    setFlagViolationModal(false);
  };

  const handleConfirmClarificationSubmit = (e) => {
    e.preventDefault();
    showSuccessAlert("Clarification Request Dispatched", `Dispatched query to Municipal Planning Authority: "${clarificationQuery}"`);
    setRequestClarificationModal(false);
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <Compass size={14} className="text-cyan-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Municipal Zoning & Land Use Compliance Workstation
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 font-mono font-bold text-xs border border-cyan-200 dark:border-cyan-800">
            PR-{numericId} • HMDA MASTER PLAN 2031
          </span>
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
              <Badge variant={complianceStatus.includes("Compliant") || complianceStatus.includes("Approved") ? "success" : "danger"}>
                {complianceStatus}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              🗺️ Zoning Compliance Workstation
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Audit Zone Type, Allowed Usage, Current Usage, Municipal Rules (FAR & Setbacks), and detected Zoning Violations.
            </p>
          </div>

          {/* THE 4 REQUIRED ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* 1. Verify */}
            <Button onClick={handleVerifyZoning} loading={isVerifying} variant="primary" size="sm" icon={ShieldCheck}>
              Verify
            </Button>

            {/* 2. Approve */}
            <Button onClick={handleApproveZoning} variant="success" size="sm" icon={CheckCircle2}>
              Approve
            </Button>

            {/* 3. Flag Violation */}
            <Button onClick={() => setFlagViolationModal(true)} variant="danger" size="sm" icon={Flag}>
              Flag Violation
            </Button>

            {/* 4. Request Clarification */}
            <Button onClick={() => setRequestClarificationModal(true)} variant="outline" size="sm" icon={HelpCircle}>
              Request Clarification
            </Button>
          </div>
        </div>

        {/* ZONING DISPLAY CARDS GRID */}
        {zoning && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. ZONE TYPE & 2. ALLOWED USAGE */}
            <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-5">
              <div>
                <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">1. MUNICIPAL ZONE TYPE</span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{zoning.zoneType}</h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase">2. Allowed Land Usage</span>
                <p className="text-slate-900 dark:text-white font-bold leading-relaxed">{zoning.allowedUsage}</p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
                <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold uppercase">3. Current Recorded Usage</span>
                <p className="text-slate-900 dark:text-white font-bold leading-relaxed">{zoning.currentUsage}</p>
              </div>
            </div>

            {/* 4. MUNICIPAL RULES & 5. VIOLATIONS & 6. COMPLIANCE STATUS */}
            <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-5">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">4. MUNICIPAL MASTER PLAN RULES</span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">FAR & Building Restrictions</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Sanctioned Max FAR</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm block mt-0.5">{zoning.municipalRules.maxFar}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Current Utilization</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold text-sm block mt-0.5">{zoning.municipalRules.currentFar}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Building Height Limit</span>
                  <strong className="text-slate-900 dark:text-white font-bold text-xs block mt-0.5">{zoning.municipalRules.maxHeight}</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Setback Requirement</span>
                  <strong className="text-slate-900 dark:text-white font-bold text-xs block mt-0.5">{zoning.municipalRules.frontSetback}</strong>
                </div>
              </div>

              {/* 5. VIOLATIONS STATUS */}
              <div className={`p-4 rounded-2xl border ${
                complianceStatus.includes("Non-Compliant")
                  ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800"
                  : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800"
              }`}>
                <span className="text-[10px] uppercase font-bold block mb-1">5. Detected Zoning Violations</span>
                <p className="font-extrabold text-sm">{zoning.violations}</p>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: FLAG VIOLATION MODAL */}
        <AnimatePresence>
          {flagViolationModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFlagViolationModal(false)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Flag size={20} className="text-rose-500" /> Flag Zoning Violation
                  </h2>
                  <button onClick={() => setFlagViolationModal(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <form onSubmit={handleConfirmViolationSubmit} className="space-y-4 text-xs font-mono">
                  <p className="text-slate-600 dark:text-slate-300 font-bold">Flag violation for property <strong className="text-rose-600">PR-{numericId}</strong></p>

                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Violation Details *</label>
                    <textarea rows={3} value={violationReason} onChange={(e) => setViolationReason(e.target.value)} required className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                    <Button onClick={() => setFlagViolationModal(false)} variant="secondary" size="sm">Cancel</Button>
                    <Button type="submit" variant="danger" size="sm">Flag Violation</Button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MODAL 2: REQUEST CLARIFICATION MODAL */}
        <AnimatePresence>
          {requestClarificationModal && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRequestClarificationModal(false)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle size={20} className="text-blue-500" /> Request Authority Clarification
                  </h2>
                  <button onClick={() => setRequestClarificationModal(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <form onSubmit={handleConfirmClarificationSubmit} className="space-y-4 text-xs font-mono">
                  <p className="text-slate-600 dark:text-slate-300 font-bold">Dispatch query to <strong className="text-blue-600">HMDA Planning Authority</strong></p>

                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Clarification Query *</label>
                    <textarea rows={3} value={clarificationQuery} onChange={(e) => setClarificationQuery(e.target.value)} required className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                    <Button onClick={() => setRequestClarificationModal(false)} variant="secondary" size="sm">Cancel</Button>
                    <Button type="submit" variant="primary" size="sm" icon={Send}>Dispatch Query</Button>
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
                    <CheckCircle2 size={20} className="text-emerald-500" /> Zoning Clearance Certificate Sealed
                  </h2>
                  <button onClick={() => setCertificateModalOpen(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <strong className="text-emerald-800 dark:text-emerald-300 font-extrabold text-sm block">100% Zoning Compliance Approved</strong>
                    <p className="text-slate-600 dark:text-slate-300">Zoning clearance certificate sealed for PR-{numericId}.</p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                    <Button onClick={() => setCertificateModalOpen(false)} variant="secondary" size="sm">Close</Button>
                    <Button onClick={() => { setCertificateModalOpen(false); exportToPdf(`Zoning_Clearance_PR_${numericId}`, zoning); }} variant="primary" size="sm" icon={FileDown}>Export PDF</Button>
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

export default Zoning;