import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  X,
  Search,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Building2,
  MapPin,
  FileDown,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  Eye,
  ArrowRight,
  Award,
} from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";
import { getLiveProperties, setLiveActiveProperty } from "../../services/liveStore";
import { exportToPdf } from "../../utils/exportUtils";
import { showSuccessAlert, showToast } from "../../utils/swal";

function ReportGeneratorModal({ isOpen, onClose, initialPropertyId }) {
  const navigate = useNavigate();
  const properties = getLiveProperties();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [modalStage, setModalStage] = useState("selection"); // 'selection' | 'generating' | 'preview'
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setModalStage("selection");
      setCurrentStepIndex(0);
      setProgressPercent(0);
      const defaultId = initialPropertyId || localStorage.getItem("active_property_id") || (properties[0] ? properties[0].numericId || properties[0].id : "1001");
      setSelectedPropertyId(defaultId ? defaultId.toString().replace(/\D/g, "") : "");
    }
  }, [isOpen, initialPropertyId]);

  if (!isOpen) return null;

  // The 5 Exact Loading Steps Requested by User
  const generationSteps = [
    { label: "Validating Property", detail: "Checking municipal parcel ID & APN registry" },
    { label: "Checking Ownership", detail: "Tracing 30-year sub-registrar title deed chain" },
    { label: "Collecting Tax History", detail: "Revalidating municipal tax challan payment receipts" },
    { label: "Calculating Risk", detail: "Running 13-vector AI hazard & encumbrance analysis" },
    { label: "Generating PDF", detail: "Rendering formal PDF due diligence certificate" },
  ];

  const handleStartGeneration = () => {
    if (!selectedPropertyId) return;

    setModalStage("generating");
    setCurrentStepIndex(0);
    setProgressPercent(10);

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = prev + 1;
        if (next >= generationSteps.length) {
          clearInterval(stepInterval);
          setProgressPercent(100);

          setTimeout(() => {
            const cleanId = selectedPropertyId.toString().replace(/\D/g, "") || "1001";
            setLiveActiveProperty(cleanId);
            setModalStage("preview");
          }, 500);

          return generationSteps.length - 1;
        }
        setProgressPercent(Math.round(((next + 1) / generationSteps.length) * 90));
        return next;
      });
    }, 400); // 400ms per step = 2.0s progressive animation
  };

  const handleDownloadPdf = () => {
    const cleanId = selectedPropertyId.toString().replace(/\D/g, "") || "1001";
    const targetProp = properties.find(
      (p) => (p.numericId || p.propertyId || p.id).toString().replace(/\D/g, "") === cleanId
    ) || properties[0];

    exportToPdf(`Due_Diligence_Report_PR-${cleanId}`, targetProp || cleanId);
  };

  const handleViewFullReport = () => {
    const cleanId = selectedPropertyId.toString().replace(/\D/g, "") || "1001";
    onClose();
    navigate(`/due-diligence-report?id=${cleanId}`);
  };

  const filteredProperties = properties.filter((p) => {
    const q = searchQuery.toLowerCase();
    const name = (p.propertyName || p.title || "").toLowerCase();
    const addr = (typeof p.address === "string" ? p.address : `${p.propertyName}, ${p.city}`).toLowerCase();
    const pid = (p.numericId || p.id || "").toString().toLowerCase();
    return name.includes(q) || addr.includes(q) || pid.includes(q);
  });

  const selectedPropObj = properties.find(
    (p) => (p.numericId || p.propertyId || p.id).toString().replace(/\D/g, "") === selectedPropertyId.toString().replace(/\D/g, "")
  ) || properties[0];

  const rScore = selectedPropObj?.riskScore ?? 14;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => modalStage !== "generating" && onClose()}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
        >
          {/* MODAL HEADER */}
          <div className="p-6 sm:px-8 border-b border-slate-100 dark:border-[#334155] flex items-center justify-between bg-slate-50/80 dark:bg-[#0F172A]/80 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-blue-600 text-white font-bold shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                  {modalStage === "preview"
                    ? "PDF Report Preview"
                    : modalStage === "generating"
                    ? "Generating Due Diligence Report..."
                    : "Download Due Diligence Report"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {modalStage === "preview"
                    ? `Parcel PR-${selectedPropertyId} • Institutional Audit Certificate`
                    : modalStage === "generating"
                    ? "Compiling 13-vector land registry, tax & flood records..."
                    : "Select a property parcel to generate an institutional 13-vector audit report"}
                </p>
              </div>
            </div>

            {modalStage !== "generating" && (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* MODAL CONTENT BODY */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
            {modalStage === "selection" && (
              /* STAGE 1: PROPERTY SELECTION */
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search properties by Name, Address or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    SELECT PROPERTY PARCEL ({filteredProperties.length})
                  </span>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {filteredProperties.map((prop) => {
                      const numId = (prop.numericId || prop.propertyId || prop.id).toString().replace(/\D/g, "");
                      const isSelected = selectedPropertyId.toString().replace(/\D/g, "") === numId;
                      const rs = prop.riskScore ?? 14;

                      return (
                        <div
                          key={numId}
                          onClick={() => setSelectedPropertyId(numId)}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            isSelected
                              ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                              : "bg-slate-50/70 dark:bg-[#0F172A]/70 border-slate-200 dark:border-[#334155] hover:border-blue-400"
                          }`}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <input
                              type="radio"
                              name="selected_property_report"
                              checked={isSelected}
                              onChange={() => setSelectedPropertyId(numId)}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400">
                                  PR-{numId}
                                </span>
                                <span className="text-[10px] font-mono text-slate-400 uppercase">
                                  {prop.city || "Hyderabad"}
                                </span>
                              </div>
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                                {prop.propertyName || prop.title}
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium flex items-center gap-1 mt-0.5">
                                <MapPin size={12} className="text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {typeof prop.address === "string" ? prop.address : `${prop.propertyName}, ${prop.city}`}
                                </span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right hidden sm:block font-mono">
                              <span className="text-[10px] text-slate-400 block uppercase">AI Risk Score</span>
                              <strong className={`text-xs font-bold ${rs > 60 ? "text-rose-600" : "text-emerald-600"}`}>
                                {100 - rs} / 100
                              </strong>
                            </div>
                            <Badge variant={rs > 60 ? "danger" : "success"}>
                              {rs > 60 ? "High Risk" : "Low Risk"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {modalStage === "generating" && (
              /* STAGE 2: LOADING PROGRESS & THE 5 LOADING STEPS */
              <div className="py-4 space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-widest block">
                    ENTERPRISE REPORT COMPILER
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Compiling Due Diligence Certificate...
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Property: <strong className="text-slate-800 dark:text-slate-200">{selectedPropObj?.propertyName || selectedPropObj?.title}</strong> (PR-{selectedPropertyId})
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-slate-600 dark:text-slate-300">Compilation Progress</span>
                    <span className="text-blue-600 dark:text-cyan-400">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 dark:bg-[#0F172A] rounded-full overflow-hidden border border-slate-200 dark:border-[#334155] p-0.5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* The 5 Loading Steps */}
                <div className="space-y-3 font-mono text-xs pt-2">
                  {generationSteps.map((step, idx) => {
                    const isDone = idx < currentStepIndex || progressPercent === 100;
                    const isCurrent = idx === currentStepIndex && progressPercent < 100;

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          isDone
                            ? "bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-slate-900 dark:text-white"
                            : isCurrent
                            ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-400 text-blue-900 dark:text-cyan-200"
                            : "bg-slate-50/40 dark:bg-[#0F172A]/40 border-slate-200/60 dark:border-[#334155]/60 text-slate-400 opacity-60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isDone ? (
                            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : isCurrent ? (
                            <Loader2 size={18} className="text-blue-600 dark:text-cyan-400 animate-spin shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shrink-0" />
                          )}
                          <div>
                            <strong className="block font-bold">{step.label}</strong>
                            <span className="text-[11px] opacity-80">{step.detail}</span>
                          </div>
                        </div>

                        <span className="text-[10px] font-bold uppercase shrink-0">
                          {isDone ? "COMPLETE" : isCurrent ? "PROCESSING..." : "QUEUED"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {modalStage === "preview" && (
              /* STAGE 3: PDF PREVIEW & DOWNLOAD */
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-3 text-emerald-900 dark:text-emerald-200 text-xs font-semibold">
                  <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <strong className="block font-extrabold text-sm">PDF Audit Certificate Ready</strong>
                    <span>Validated 13-vector due diligence report generated for parcel PR-{selectedPropertyId}.</span>
                  </div>
                </div>

                {/* PDF Document Preview Box */}
                <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 font-mono text-xs shadow-xl border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <Award size={16} /> OFFICIAL DUE DILIGENCE CERTIFICATE
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-800">
                      PASSED (CLEAR TITLE)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-500 uppercase block">Property Name:</span>
                      <strong className="text-slate-200 text-xs">{selectedPropObj?.propertyName || selectedPropObj?.title}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block">Parcel ID:</span>
                      <strong className="text-cyan-400 text-xs">PR-{selectedPropertyId}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block">Primary Owner:</span>
                      <span className="text-slate-300">{selectedPropObj?.ownerName || selectedPropObj?.owner || "Ananya Rao"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 uppercase block">Market Value:</span>
                      <span className="text-blue-400 font-bold">{selectedPropObj?.marketValue ? `₹ ${(selectedPropObj.marketValue / 10000000).toFixed(2)} Cr` : "₹ 25.00 Cr"}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-[10px]">
                    <div className="flex justify-between text-emerald-400">
                      <span>✓ 30-Year Title Deed Chain Audit:</span>
                      <strong>VERIFIED CLEAR</strong>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>✓ Municipal Property Tax Receipts:</span>
                      <strong>PAID IN FULL</strong>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>✓ FIRM Hydrological Flood Survey:</span>
                      <strong>ZONE X (SAFE)</strong>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>✓ AI Trust Score:</span>
                      <strong>{100 - rScore} / 100 (LOW RISK)</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* MODAL FOOTER */}
          <div className="p-4 sm:px-8 border-t border-slate-100 dark:border-[#334155] bg-slate-50/80 dark:bg-[#0F172A]/80 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 font-mono">
              Selected Parcel: <strong className="text-slate-900 dark:text-white">{selectedPropertyId ? `PR-${selectedPropertyId}` : "None"}</strong>
            </span>

            {modalStage === "selection" && (
              <div className="flex items-center gap-3">
                <Button onClick={onClose} variant="secondary" size="sm">
                  Cancel
                </Button>
                <Button
                  onClick={handleStartGeneration}
                  disabled={!selectedPropertyId}
                  variant="primary"
                  size="sm"
                  icon={FileDown}
                >
                  Generate Report
                </Button>
              </div>
            )}

            {modalStage === "preview" && (
              <div className="flex items-center gap-3">
                <Button onClick={handleViewFullReport} variant="secondary" size="sm" icon={Eye}>
                  Full Report
                </Button>
                <Button onClick={handleDownloadPdf} variant="primary" size="sm" icon={FileDown}>
                  Download PDF
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default ReportGeneratorModal;
