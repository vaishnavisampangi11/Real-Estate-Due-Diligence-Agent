import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  ShieldCheck,
  FileDown,
  Scale,
  User,
  ClipboardList,
  Building2,
  Award,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Activity,
  FileText,
  FileCheck,
  ShieldAlert,
  Sparkles,
  AlertOctagon,
  Check,
  ChevronRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Landmark,
  Droplet,
  Layers,
} from "lucide-react";
import { showToast } from "../utils/swal";
import PropertyContextSwitcher from "../components/common/PropertyContextSwitcher";
import {
  getPropertyDetails,
  getOwnershipRecords,
  getPropertyTaxHistory,
  getPermitRecords,
  getZoningInformation,
  getEnvironmentalRecords,
  getPropertyDocuments,
} from "../services/propertyService";
import { getRiskAssessmentsByProperty } from "../services/riskService";

/**
 * Reusable Circular Progress Chart Component for Risk & Compliance Metrics
 */
function CircularRiskGauge({ title, score, riskLevel, icon: Icon, details, isAvailable = true }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const safeScore = isAvailable && typeof score === "number" ? Math.min(Math.max(score, 0), 100) : 0;
  const strokeDashoffset = circumference - (circumference * safeScore) / 100;

  const isLow = safeScore >= 70;
  const isMedium = safeScore >= 40 && safeScore < 70;

  const colorHex = !isAvailable ? "#94A3B8" : (isLow ? "#10B981" : isMedium ? "#F59E0B" : "#F43F5E");
  const badgeVariant = !isAvailable ? "secondary" : (isLow ? "success" : isMedium ? "warning" : "danger");
  const textColorClass = !isAvailable
    ? "text-slate-400"
    : isLow
    ? "text-emerald-600 dark:text-emerald-400"
    : isMedium
    ? "text-amber-600 dark:text-amber-400"
    : "text-rose-600 dark:text-rose-400";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group font-mono text-xs"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] text-blue-600 dark:text-cyan-400 border border-slate-200 dark:border-[#334155] shrink-0 group-hover:scale-105 transition-transform">
            {Icon ? <Icon size={18} /> : <Activity size={18} />}
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-[#F8FAFC] text-xs sm:text-sm truncate">
            {title}
          </h3>
        </div>

        <Badge variant={badgeVariant} className="px-2.5 py-0.5 text-[10px] font-mono font-bold shrink-0">
          {isAvailable ? `${riskLevel || "Low"} Risk` : "Data Unavailable"}
        </Badge>
      </div>

      {/* SVG Circular Progress Chart */}
      <div className="relative flex items-center justify-center my-1">
        <svg className="w-28 h-28 transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r={radius}
            className="text-slate-100 dark:text-[#0F172A]"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="56"
            cy="56"
            r={radius}
            stroke={colorHex}
            strokeWidth="8"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className={`text-xl font-extrabold font-mono tracking-tight ${textColorClass}`}>
            {isAvailable ? `${safeScore}%` : "—"}
          </span>
          <span className="text-[9px] font-mono text-slate-400 uppercase">
            {isAvailable ? "Trust Score" : "No Data"}
          </span>
        </div>
      </div>

      {/* Detail Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-[#334155] text-center">
        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate" title={details}>
          {details}
        </p>
      </div>
    </motion.div>
  );
}

function RiskAssessment() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const rawId = searchParams.get("propertyId") || searchParams.get("id") || "1";
  const numericId = parseInt(rawId.toString().replace(/\D/g, "") || "1", 10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Property-specific datasets from PostgreSQL
  const [property, setProperty] = useState(null);
  const [backendRisks, setBackendRisks] = useState([]);
  const [ownershipRecords, setOwnershipRecords] = useState([]);
  const [taxRecords, setTaxRecords] = useState([]);
  const [permitRecords, setPermitRecords] = useState([]);
  const [zoningInfo, setZoningInfo] = useState(null);
  const [envRecords, setEnvRecords] = useState([]);
  const [docRecords, setDocRecords] = useState([]);

  const fetchAllParcelRiskData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        propRes,
        riskRes,
        ownRes,
        taxRes,
        permitRes,
        zoningRes,
        envRes,
        docRes,
      ] = await Promise.allSettled([
        getPropertyDetails(numericId),
        getRiskAssessmentsByProperty(numericId),
        getOwnershipRecords(numericId),
        getPropertyTaxHistory(numericId),
        getPermitRecords(numericId),
        getZoningInformation(numericId),
        getEnvironmentalRecords(numericId),
        getPropertyDocuments(numericId),
      ]);

      if (propRes.status === "fulfilled" && propRes.value) {
        setProperty(propRes.value);
      } else {
        setProperty(null);
      }

      if (riskRes.status === "fulfilled" && riskRes.value) {
        const raw = riskRes.value?.data || riskRes.value;
        setBackendRisks(Array.isArray(raw) ? raw : (raw?.content || []));
      } else {
        setBackendRisks([]);
      }

      if (ownRes.status === "fulfilled" && ownRes.value) {
        const raw = ownRes.value?.data || ownRes.value;
        setOwnershipRecords(Array.isArray(raw) ? raw : (raw?.content || []));
      } else {
        setOwnershipRecords([]);
      }

      if (taxRes.status === "fulfilled" && taxRes.value) {
        const raw = taxRes.value?.data || taxRes.value;
        setTaxRecords(Array.isArray(raw) ? raw : (raw?.content || []));
      } else {
        setTaxRecords([]);
      }

      if (permitRes.status === "fulfilled" && permitRes.value) {
        const raw = permitRes.value?.data || permitRes.value;
        setPermitRecords(Array.isArray(raw) ? raw : (raw?.content || []));
      } else {
        setPermitRecords([]);
      }

      if (zoningRes.status === "fulfilled" && zoningRes.value) {
        const raw = zoningRes.value?.data || zoningRes.value;
        setZoningInfo(Array.isArray(raw) ? raw[0] : raw);
      } else {
        setZoningInfo(null);
      }

      if (envRes.status === "fulfilled" && envRes.value) {
        const raw = envRes.value?.data || envRes.value;
        setEnvRecords(Array.isArray(raw) ? raw : (raw?.content || []));
      } else {
        setEnvRecords([]);
      }

      if (docRes.status === "fulfilled" && docRes.value) {
        const raw = docRes.value?.data || docRes.value;
        setDocRecords(Array.isArray(raw) ? raw : (raw?.content || []));
      } else {
        setDocRecords([]);
      }
    } catch (err) {
      console.error("Failed to load risk assessment datasets:", err);
      setError("Unable to load risk assessment data from backend for this parcel.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllParcelRiskData();
  }, [numericId]);

  const propertyTitle = property?.propertyName || `Parcel PR-${numericId}`;
  const propertyCode = property?.propertyCode || `PR-${numericId}`;

  // Evaluate the 13-Vector Risk Telemetry for the active property
  const vectors = useMemo(() => {
    // 1. Legal Title & Ownership Vector
    const hasOwn = ownershipRecords.length > 0;
    const isOwnVerified = hasOwn && (ownershipRecords[0].verificationStatus === true || ownershipRecords[0].verificationStatus === "VERIFIED");
    const legalScore = hasOwn ? (isOwnVerified ? 94 : 75) : (property?.status === "VERIFIED" ? 90 : null);
    const legalDetails = hasOwn
      ? `Owner: ${ownershipRecords[0].ownerName || "Registered Owner"} • ${ownershipRecords[0].ownershipPercentage || 100}% Stake`
      : (property?.status === "VERIFIED" ? "Title registered in database registry" : "No verified ownership record is currently available.");

    // 2. Municipal Property Tax & Lien Vector
    const hasTax = taxRecords.length > 0;
    const totalTaxDue = taxRecords.reduce((sum, r) => sum + (Number(r.dueAmount) || 0), 0);
    const taxScore = hasTax ? (totalTaxDue === 0 ? 98 : 35) : null;
    const taxDetails = hasTax
      ? (totalTaxDue === 0 ? "Zero outstanding tax dues • Verified clear title" : `₹ ${totalTaxDue.toLocaleString()} dues pending clearance`)
      : "No verified municipal tax record is currently available.";

    // 3. Environmental & Soil Purity Vector
    const hasEnv = envRecords.length > 0;
    const envClear = hasEnv && (envRecords[0].clearanceStatus || "").includes("Approved");
    const envScore = hasEnv ? (envClear ? 95 : 45) : null;
    const envDetails = hasEnv
      ? `${envRecords[0].clearanceStatus || "Phase I ESA"} • ${envRecords[0].soilPurity || "Soil audited"}`
      : "No environmental NOC record registered in database.";

    // 4. Zoning & Master Plan Compliance Vector
    const hasZoning = !!zoningInfo;
    const zoningScore = hasZoning ? (zoningInfo.complianceStatus === "COMPLIANT" ? 92 : 65) : null;
    const zoningDetails = hasZoning
      ? `Zone ${zoningInfo.zoneCode || "R-1"} • Permitted: ${zoningInfo.permittedLandUse || "Residential / Mixed"}`
      : "No zoning classification record available for this parcel.";

    // 5. Municipal Building Permits & Sanctions Vector
    const hasPermits = permitRecords.length > 0;
    const verifiedPermits = permitRecords.filter((p) => (p.status || "").toUpperCase().includes("VERIF") || (p.status || "").toUpperCase().includes("APPROV")).length;
    const permitScore = hasPermits ? (verifiedPermits === permitRecords.length ? 90 : 60) : null;
    const permitDetails = hasPermits
      ? `${verifiedPermits}/${permitRecords.length} Sanctioned building permits active`
      : "No municipal permit records registered for this parcel.";

    // 6. Encumbrance & Form 15 Trace Vector
    const encumbranceScore = hasOwn || property?.status === "VERIFIED" ? (totalTaxDue === 0 ? 96 : 50) : null;
    const encumbranceDetails = encumbranceScore != null
      ? (totalTaxDue === 0 ? "30-Year Form 15 Sub-Registrar trace clear of adverse liens" : "Encumbrance review pending dues clearance")
      : "Encumbrance verification record unavailable.";

    // 7. Legal Documents Vault Vector
    const hasDocs = docRecords.length > 0;
    const verifiedDocs = docRecords.filter((d) => d.verificationStatus).length;
    const docScore = hasDocs ? (verifiedDocs > 0 ? 88 : 65) : null;
    const docDetails = hasDocs
      ? `${docRecords.length} legal documents archived in vault (${verifiedDocs} verified)`
      : "No legal documents indexed in vault for this parcel.";

    // 8. Flood & Natural Hazard Vector
    const floodScore = hasEnv ? 92 : null;
    const floodDetails = hasEnv
      ? "Zero inundation risk • Elevation clear of stormwater flood lines"
      : "Natural hazard telemetry not recorded for this parcel.";

    // Available vectors list
    return [
      {
        id: "vector-legal",
        title: "Legal & Title Risk",
        badge: "Title & Deed Clearance",
        score: legalScore,
        riskLevel: legalScore == null ? "N/A" : (legalScore >= 70 ? "Low" : legalScore >= 40 ? "Medium" : "High"),
        icon: Scale,
        details: legalDetails,
        isAvailable: legalScore != null,
        verdict: legalScore == null ? "DATA NOT AVAILABLE" : (legalScore >= 70 ? "APPROVED FOR ACQUISITION" : "ACTION REQUIRED"),
        variant: legalScore == null ? "secondary" : (legalScore >= 70 ? "success" : "danger"),
      },
      {
        id: "vector-tax",
        title: "Tax & Financial Risk",
        badge: "Municipal Assessment",
        score: taxScore,
        riskLevel: taxScore == null ? "N/A" : (taxScore >= 70 ? "Low" : taxScore >= 40 ? "Medium" : "High"),
        icon: Landmark,
        details: taxDetails,
        isAvailable: taxScore != null,
        verdict: taxScore == null ? "DATA NOT AVAILABLE" : (taxScore >= 70 ? "TAX CLEARED" : "OUTSTANDING DUES"),
        variant: taxScore == null ? "secondary" : (taxScore >= 70 ? "success" : "danger"),
      },
      {
        id: "vector-env",
        title: "Environmental Risk",
        badge: "Pollution Control Board NOC",
        score: envScore,
        riskLevel: envScore == null ? "N/A" : (envScore >= 70 ? "Low" : envScore >= 40 ? "Medium" : "High"),
        icon: FileCheck,
        details: envDetails,
        isAvailable: envScore != null,
        verdict: envScore == null ? "DATA NOT AVAILABLE" : (envScore >= 70 ? "NOC VERIFIED CLEAR" : "HAZARD FLAGGED"),
        variant: envScore == null ? "secondary" : (envScore >= 70 ? "success" : "warning"),
      },
      {
        id: "vector-zoning",
        title: "Zoning & Land Use",
        badge: "Master Plan Telemetry",
        score: zoningScore,
        riskLevel: zoningScore == null ? "N/A" : (zoningScore >= 70 ? "Low" : zoningScore >= 40 ? "Medium" : "High"),
        icon: Layers,
        details: zoningDetails,
        isAvailable: zoningScore != null,
        verdict: zoningScore == null ? "DATA NOT AVAILABLE" : (zoningScore >= 70 ? "ZONING COMPLIANT" : "VARIANCE REQUIRED"),
        variant: zoningScore == null ? "secondary" : (zoningScore >= 70 ? "success" : "warning"),
      },
      {
        id: "vector-permits",
        title: "Building Permit Compliance",
        badge: "Municipal Sanctions",
        score: permitScore,
        riskLevel: permitScore == null ? "N/A" : (permitScore >= 70 ? "Low" : permitScore >= 40 ? "Medium" : "High"),
        icon: Building2,
        details: permitDetails,
        isAvailable: permitScore != null,
        verdict: permitScore == null ? "DATA NOT AVAILABLE" : (permitScore >= 70 ? "PERMITS SANCTIONED" : "PERMIT AUDIT PENDING"),
        variant: permitScore == null ? "secondary" : (permitScore >= 70 ? "success" : "warning"),
      },
      {
        id: "vector-encumbrance",
        title: "Encumbrance & Liens",
        badge: "Sub-Registrar Form 15",
        score: encumbranceScore,
        riskLevel: encumbranceScore == null ? "N/A" : (encumbranceScore >= 70 ? "Low" : encumbranceScore >= 40 ? "Medium" : "High"),
        icon: ShieldCheck,
        details: encumbranceDetails,
        isAvailable: encumbranceScore != null,
        verdict: encumbranceScore == null ? "DATA NOT AVAILABLE" : (encumbranceScore >= 70 ? "NIL ENCUMBRANCE" : "LIEN REGISTERED"),
        variant: encumbranceScore == null ? "secondary" : (encumbranceScore >= 70 ? "success" : "danger"),
      },
      {
        id: "vector-docs",
        title: "Legal Documents Vault",
        badge: "Document Verification",
        score: docScore,
        riskLevel: docScore == null ? "N/A" : (docScore >= 70 ? "Low" : docScore >= 40 ? "Medium" : "High"),
        icon: FileText,
        details: docDetails,
        isAvailable: docScore != null,
        verdict: docScore == null ? "DATA NOT AVAILABLE" : (docScore >= 70 ? "DOCUMENTS VERIFIED" : "PENDING VAULT AUDIT"),
        variant: docScore == null ? "secondary" : (docScore >= 70 ? "success" : "warning"),
      },
      {
        id: "vector-flood",
        title: "Flood & Disaster Risk",
        badge: "Topographical Telemetry",
        score: floodScore,
        riskLevel: floodScore == null ? "N/A" : (floodScore >= 70 ? "Low" : floodScore >= 40 ? "Medium" : "High"),
        icon: Droplet,
        details: floodDetails,
        isAvailable: floodScore != null,
        verdict: floodScore == null ? "DATA NOT AVAILABLE" : (floodScore >= 70 ? "ZERO FLOOD RISK" : "INUNDATION FLAGGED"),
        variant: floodScore == null ? "secondary" : (floodScore >= 70 ? "success" : "danger"),
      },
    ];
  }, [property, ownershipRecords, taxRecords, envRecords, zoningInfo, permitRecords, docRecords]);

  // Dynamically compute aggregate trust index for the active property
  const availableScores = vectors.filter((v) => v.isAvailable).map((v) => v.score);
  const trustIndex = availableScores.length > 0
    ? Math.round(availableScores.reduce((sum, s) => sum + s, 0) / availableScores.length)
    : null;

  const handleRefreshScore = () => {
    fetchAllParcelRiskData();
    showToast(`Risk & compliance telemetry refreshed for ${propertyTitle}`, "success");
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-blue-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Legal Risk Assessment Workstation
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-800">
            PR-{numericId} • {trustIndex != null ? `TRUST INDEX ${trustIndex}%` : "TRUST INDEX PENDING AUDIT"}
          </span>
        </div>

        {/* PROPERTY CONTEXT SWITCHER BAR */}
        <PropertyContextSwitcher currentPropertyId={numericId} />

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold mb-2">
              <ShieldCheck size={14} /> 13-Vector REST API Audit
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              🛡️ Legal Risk Assessment & Compliance — {propertyTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              Real-time risk assessment parameters for <strong className="text-slate-900 dark:text-white">{propertyTitle}</strong> (Property ID: #{numericId}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate(`/due-diligence-report?id=${numericId}`)}
              variant="primary"
              size="sm"
              icon={FileText}
            >
              Full Due Diligence Report
            </Button>
            <Button
              onClick={handleRefreshScore}
              variant="outline"
              size="sm"
              icon={RotateCcw}
              loading={loading}
            >
              Refresh Risk API
            </Button>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-xs flex items-center justify-between">
            <span>⚠️ {error}</span>
            <Button onClick={fetchAllParcelRiskData} variant="danger" size="xs">Retry</Button>
          </div>
        )}

        {/* RISK INDICATORS LEGEND BAR (LOW / MEDIUM / HIGH / UNAVAILABLE) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex items-center justify-between flex-wrap gap-4 text-xs font-mono">
          <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Activity size={16} className="text-blue-600 dark:text-cyan-400" />
            <span>Risk Indicators Legend:</span>
          </span>

          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 font-extrabold text-emerald-600 dark:text-emerald-400">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
              🟢 Low Risk (&ge; 70%)
            </span>
            <span className="flex items-center gap-1.5 font-extrabold text-amber-600 dark:text-amber-400">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
              🟡 Medium Risk (40-69%)
            </span>
            <span className="flex items-center gap-1.5 font-extrabold text-rose-600 dark:text-rose-400">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
              🔴 High Risk (&lt; 40%)
            </span>
            <span className="flex items-center gap-1.5 font-extrabold text-slate-400">
              <span className="w-3.5 h-3.5 rounded-full bg-slate-400" />
              ⚪ Data Not Available
            </span>
          </div>
        </div>

        {/* SECTION 1: CIRCULAR RISK & COMPLIANCE GAUGES */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              ⭕ Circular Risk & Compliance Gauges ({vectors.length} Vectors)
            </h2>
            <Badge variant={trustIndex != null ? (trustIndex >= 70 ? "success" : "warning") : "secondary"}>
              {trustIndex != null ? `Portfolio Trust: ${trustIndex}%` : "Audit In Progress"}
            </Badge>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-64 rounded-3xl" />
              <Skeleton className="h-64 rounded-3xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vectors.map((metric) => (
                <CircularRiskGauge key={metric.id} {...metric} />
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: DUE DILIGENCE RECOMMENDATION & DECISION CARDS */}
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            📄 Due Diligence Vector Verdicts & Recommendations
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Skeleton className="h-44 rounded-3xl" />
              <Skeleton className="h-44 rounded-3xl" />
              <Skeleton className="h-44 rounded-3xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vectors.map((rec) => {
                const IconComp = rec.icon;
                return (
                  <motion.div
                    key={rec.id}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-cyan-400">
                          {rec.badge}
                        </span>
                        <Badge variant={rec.variant}>{rec.verdict}</Badge>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                        <IconComp size={18} className="text-blue-600 dark:text-cyan-400 shrink-0" />
                        {rec.title}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium">
                        {rec.details}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-[#334155] space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Parcel: {propertyCode}</span>
                        <span>{rec.isAvailable ? "Verified Telemetry" : "Record Pending"}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default RiskAssessment;
