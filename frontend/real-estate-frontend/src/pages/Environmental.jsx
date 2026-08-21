import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import {
  Leaf,
  FileCheck,
  Search,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Sparkles,
  X,
  Droplet,
  Wind,
  Layers,
  Sliders,
  Activity,
  AlertTriangle,
  Award,
  FlaskConical,
  Flag,
  RotateCcw,
  Check,
  Send,
} from "lucide-react";
import { showSuccessAlert, showToast } from "../utils/swal";
import PropertyContextSwitcher from "../components/common/PropertyContextSwitcher";
import { getLiveActiveProperty } from "../services/liveStore";
import { getEnvironmentalRecords } from "../services/propertyService";

function Environmental() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeProp = getLiveActiveProperty(searchParams.get("propertyId") || searchParams.get("id"));
  const propertyIdParam = activeProp ? (activeProp.propertyId || activeProp.numericId || "1").toString() : "1";
  const numericId = propertyIdParam.replace(/\D/g, "") || "1";

  const [clearanceStatus, setClearanceStatus] = useState("Phase I ESA Approved");
  const [isVerifying, setIsVerifying] = useState(false);

  // Interactive Soil Depth Sampling Slider (in meters)
  const [sampleDepthMeters, setSampleDepthMeters] = useState(15);

  // Modals state
  const [flagHazardModalOpen, setFlagHazardModalOpen] = useState(false);
  const [hazardReason, setHazardReason] = useState("Sub-surface heavy metal trace detected at 25m depth line.");

  useEffect(() => {
    if (!numericId) return;
    getEnvironmentalRecords(numericId)
      .then((res) => {
        if (res && res.data) {
          const e = Array.isArray(res.data) ? res.data[0] : res.data;
          if (e && e.clearanceStatus) {
            setClearanceStatus(e.clearanceStatus);
          }
        }
      })
      .catch((err) => console.warn("Environmental backend query error:", err));
  }, [numericId]);

  const currentEnv = {
    clearanceStatus: clearanceStatus,
    environmentalRisks: "Zero Hazardous Contaminants Detected",
    pollutionInfo: "State Pollution Control Board NOC Active",
    soilPurity: `${(99.8 - (sampleDepthMeters > 20 ? 0.4 : 0)).toFixed(1)}% Mineral Purity`,
    groundwaterPurity: "99.4% (Zero Hydrocarbon Leaches)",
    aqiIndex: 42,
    inspectionDate: "14 May 2025",
    nocNumber: `SPCB/TS/2025/${7700 + parseInt(numericId)}`,
  };

  // ACTION BUTTON HANDLERS
  const handleVerifyNoc = () => {
    setIsVerifying(true);
    showToast("Auditing Pollution Control Board Soil NOC Registry...", "info");

    setTimeout(() => {
      setIsVerifying(false);
      setClearanceStatus("Phase I ESA Approved");
      showSuccessAlert(
        "Environmental Audit Complete",
        `State Pollution Control Board NOC verified clear for PR-${numericId} (SPCB/TS/2025/${7700 + parseInt(numericId)}).`
      );
    }, 800);
  };

  const handleRunSampling = () => {
    showToast(`Running soil & groundwater telemetry analysis at ${sampleDepthMeters}m depth...`, "info");
  };

  const handleConfirmHazardSubmit = (e) => {
    e.preventDefault();
    setClearanceStatus("Hazard Flagged");
    showSuccessAlert("Environmental Hazard Flagged", `Flagged hazard on PR-${numericId}: "${hazardReason}"`);
    setFlagHazardModalOpen(false);
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <Leaf size={14} className="text-emerald-500 dark:text-emerald-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              State Pollution Control Board Environmental Audit Workstation
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs border border-emerald-200 dark:border-emerald-800">
            PR-{numericId} • PHASE I ESA CLEARED
          </span>
        </div>

        {/* PROPERTY CONTEXT SWITCHER BAR */}
        <PropertyContextSwitcher currentPropertyId={numericId} />

        {/* HERO BANNER & 4 ACTION BUTTONS */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
              <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
                PR-{numericId}
              </span>
              <Badge variant={clearanceStatus.includes("Approved") ? "success" : "danger"}>
                {clearanceStatus}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              🍃 Environmental NOC & Soil Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Inspect Pollution Control Board NOC, Phase I ESA environmental clearance, soil mineral purity, and groundwater hydrocarbon testing.
            </p>
          </div>

          {/* THE 3 ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button onClick={handleVerifyNoc} loading={isVerifying} variant="primary" size="sm" icon={ShieldCheck}>
              Verify NOC
            </Button>

            <Button onClick={handleRunSampling} variant="outline" size="sm" icon={FlaskConical}>
              Run Soil Sampling
            </Button>

            <Button onClick={() => setFlagHazardModalOpen(true)} variant="danger" size="sm" icon={Flag}>
              Flag Hazard
            </Button>
          </div>
        </div>

        {/* TELEMETRY METRIC CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. PCB NOC Registration */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">PCB NOC NUMBER</span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{currentEnv.nocNumber}</h3>
            <p className="text-slate-500 text-[11px]">Issued 14 May 2025 • Active</p>
          </div>

          {/* 2. Soil Purity */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase">SOIL PURITY INDEX</span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{currentEnv.soilPurity}</h3>
            <p className="text-emerald-500 font-bold text-[11px]">Tested at {sampleDepthMeters}m Depth</p>
          </div>

          {/* 3. Groundwater Hydrocarbon Purity */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">GROUNDWATER PURITY</span>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{currentEnv.groundwaterPurity}</h3>
            <p className="text-slate-500 text-[11px]">Zero Leach Hazards</p>
          </div>

          {/* 4. Air Quality Index */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-2">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">AIR QUALITY INDEX (AQI)</span>
            <h3 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{currentEnv.aqiIndex} AQI (Good)</h3>
            <p className="text-slate-500 text-[11px]">Clean Atmosphere Certified</p>
          </div>
        </div>

        {/* INTERACTIVE SOIL DEPTH SAMPLING SLIDER PANEL */}
        <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4 gap-4">
            <div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase">INTERACTIVE TELEMETRY GAUGE</span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <FlaskConical size={20} className="text-blue-500" />
                Soil Core Depth Sampling Gauge ({sampleDepthMeters} Meters)
              </h2>
            </div>
            <Badge variant="success">{sampleDepthMeters}m Core Depth</Badge>
          </div>

          <div className="space-y-4 p-6 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-700 dark:text-slate-300">Soil Sampling Core Depth:</span>
              <span className="text-blue-600 dark:text-cyan-400 text-sm font-extrabold">{sampleDepthMeters} Meters Below Surface</span>
            </div>

            <input
              type="range"
              min="1"
              max="30"
              value={sampleDepthMeters}
              onChange={(e) => setSampleDepthMeters(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>1m (Surface Soil)</span>
              <span>15m (Bedrock Stratum)</span>
              <span>30m (Deep Aquifer)</span>
            </div>
          </div>
        </div>

        {/* MODAL: FLAG ENVIRONMENTAL HAZARD MODAL */}
        <AnimatePresence>
          {flagHazardModalOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFlagHazardModalOpen(false)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Flag size={20} className="text-rose-500" /> Flag Environmental Hazard
                  </h2>
                  <button onClick={() => setFlagHazardModalOpen(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <form onSubmit={handleConfirmHazardSubmit} className="space-y-4 text-xs font-mono">
                  <p className="text-slate-600 dark:text-slate-300 font-bold">Record hazard for <strong className="text-rose-600">PR-{numericId}</strong></p>

                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Hazard Description *</label>
                    <textarea rows={3} value={hazardReason} onChange={(e) => setHazardReason(e.target.value)} required className="w-full p-3 rounded-xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                    <Button onClick={() => setFlagHazardModalOpen(false)} variant="secondary" size="sm">Cancel</Button>
                    <Button type="submit" variant="danger" size="sm">Flag Hazard</Button>
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

export default Environmental;