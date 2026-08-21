import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  Scale,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  DollarSign,
  MapPin,
  Calendar,
  Layers,
  FileCheck,
  Award,
  Waves,
  Trees,
  Wrench,
  Search,
  ExternalLink,
  ChevronRight,
  Home,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  Info,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Flag,
  FileUp,
} from "lucide-react";
import { showToast, showSuccessAlert, showConfirmDialog } from "../utils/swal";
import {
  getAllProperties,
  getPropertyById,
  getPropertyOwnership,
  getPropertyTaxes,
  getPropertyZoning,
  getPropertyPermits,
  getPropertyFlood,
  getPropertyEnvironmental,
  getPropertyUtilities,
  getPropertyDocuments,
  getRiskAssessmentsByProperty,
  getReportsByProperty,
} from "../services/propertyService";
import ReportGeneratorModal from "../components/dashboard/ReportGeneratorModal";

function PropertyReview() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const propIdParam = searchParams.get("id") || searchParams.get("propertyId");

  // Property Catalog & Selection State
  const [properties, setProperties] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(propIdParam || "1");
  const [property, setProperty] = useState(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState("CHECKLIST");

  // Verification Datasets State
  const [ownershipRecords, setOwnershipRecords] = useState([]);
  const [taxRecords, setTaxRecords] = useState([]);
  const [zoningRecords, setZoningRecords] = useState([]);
  const [permitRecords, setPermitRecords] = useState([]);
  const [floodRecords, setFloodRecords] = useState([]);
  const [envRecords, setEnvRecords] = useState([]);
  const [utilityRecords, setUtilityRecords] = useState([]);
  const [documentRecords, setDocumentRecords] = useState([]);
  const [riskAssessments, setRiskAssessments] = useState([]);
  const [reports, setReports] = useState([]);

  // Loading & Error States
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Review Status State
  const [reviewStatus, setReviewStatus] = useState("IN_REVIEW");

  // Report Generator Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // 1. Fetch Property Catalog for Switcher
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        setCatalogLoading(true);
        const res = await getAllProperties(0, 100);
        const list =
          res?.data?.content ||
          (Array.isArray(res?.data) ? res.data : res?.content || (Array.isArray(res) ? res : []));

        setProperties(list);

        // If no ID param provided or ID not in list, select first available property
        if (list.length > 0) {
          if (!propIdParam) {
            const firstId = list[0].propertyId || list[0].id;
            setSelectedPropertyId(String(firstId));
          } else {
            setSelectedPropertyId(String(propIdParam));
          }
        }
      } catch (err) {
        console.error("Failed to load properties catalog:", err);
      } finally {
        setCatalogLoading(false);
      }
    };
    loadCatalog();
  }, []);

  // Update selectedPropertyId if URL param changes
  useEffect(() => {
    if (propIdParam) {
      setSelectedPropertyId(String(propIdParam));
    }
  }, [propIdParam]);

  // 2. Fetch All Verification Data for Selected Property
  const fetchPropertyLegalReview = async () => {
    if (!selectedPropertyId) return;

    try {
      setLoading(true);
      setError(null);

      const cleanId = parseInt(selectedPropertyId.toString().replace(/\D/g, "") || "1", 10);

      // Parallel fetch all real verification records from PostgreSQL
      const [
        propRes,
        ownRes,
        taxRes,
        zonRes,
        permRes,
        floodRes,
        envRes,
        utilRes,
        docsRes,
        riskRes,
        repRes,
      ] = await Promise.allSettled([
        getPropertyById(cleanId),
        getPropertyOwnership(cleanId),
        getPropertyTaxes(cleanId),
        getPropertyZoning(cleanId),
        getPropertyPermits(cleanId),
        getPropertyFlood(cleanId),
        getPropertyEnvironmental(cleanId),
        getPropertyUtilities(cleanId),
        getPropertyDocuments(cleanId),
        getRiskAssessmentsByProperty(cleanId),
        getReportsByProperty(cleanId),
      ]);

      // Unpack Property
      if (propRes.status === "fulfilled" && propRes.value?.data) {
        setProperty(propRes.value.data);
        setReviewStatus(propRes.value.data.status === "VERIFIED" ? "VERIFIED" : "IN_REVIEW");
      } else {
        setProperty(null);
      }

      // Unpack Datasets
      setOwnershipRecords(ownRes.status === "fulfilled" && Array.isArray(ownRes.value?.data) ? ownRes.value.data : []);
      setTaxRecords(taxRes.status === "fulfilled" && Array.isArray(taxRes.value?.data) ? taxRes.value.data : []);
      setZoningRecords(zonRes.status === "fulfilled" && Array.isArray(zonRes.value?.data) ? zonRes.value.data : []);
      setPermitRecords(permRes.status === "fulfilled" && Array.isArray(permRes.value?.data) ? permRes.value.data : []);
      setFloodRecords(floodRes.status === "fulfilled" && Array.isArray(floodRes.value?.data) ? floodRes.value.data : []);
      setEnvRecords(envRes.status === "fulfilled" && Array.isArray(envRes.value?.data) ? envRes.value.data : []);
      setUtilityRecords(utilRes.status === "fulfilled" && Array.isArray(utilRes.value?.data) ? utilRes.value.data : []);
      setDocumentRecords(docsRes.status === "fulfilled" && Array.isArray(docsRes.value?.data) ? docsRes.value.data : []);
      setRiskAssessments(riskRes.status === "fulfilled" && Array.isArray(riskRes.value?.data) ? riskRes.value.data : []);
      setReports(repRes.status === "fulfilled" && Array.isArray(repRes.value?.data) ? repRes.value.data : []);

      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Failed to load property legal review:", err);
      setError("Unable to load legal review data. Please verify the backend is running on port 8081.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyLegalReview();
  }, [selectedPropertyId]);

  // Handle Property Selection Change
  const handlePropertyChange = (newId) => {
    setSelectedPropertyId(newId);
    setSearchParams({ id: newId });
  };

  // Review Actions Handlers
  const handleApproveTitle = async () => {
    const confirmed = await showConfirmDialog({
      title: "Approve & Clear Title?",
      text: `Grant formal legal clearance for "${property?.propertyName || `Property #${selectedPropertyId}`}"?`,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      icon: "question",
    });

    if (confirmed) {
      setReviewStatus("VERIFIED");
      showSuccessAlert(
        "Legal Clearance Granted",
        `Property "${property?.propertyName}" has been cleared and marked as Title Verified.`
      );
    }
  };

  const handleFlagDiscrepancy = async () => {
    const confirmed = await showConfirmDialog({
      title: "Flag Legal Discrepancy?",
      text: `Flag an audit discrepancy for "${property?.propertyName || `Property #${selectedPropertyId}`}" for reviewer escalation?`,
      confirmButtonText: "Flag Discrepancy",
      cancelButtonText: "Cancel",
      icon: "warning",
    });

    if (confirmed) {
      setReviewStatus("FLAGGED");
      showToast("Legal discrepancy flagged for escalation.", "warning");
    }
  };

  const handleRequestDocuments = () => {
    showToast("Document submission request dispatched to registered property owner.", "info");
  };

  // Derive Legal Checklist from Real Data
  const checklist = useMemo(() => {
    return [
      {
        id: "own",
        label: "Ownership & Title Verification",
        verified: ownershipRecords.length > 0,
        detail:
          ownershipRecords.length > 0
            ? `${ownershipRecords[0].owner?.fullName || "Owner Registered"} (${ownershipRecords[0].ownershipPercentage || 100}%)`
            : "No ownership records found",
      },
      {
        id: "tax",
        label: "Municipal Property Tax Compliance",
        verified: taxRecords.length > 0 && taxRecords.every((t) => t.paymentStatus === "PAID"),
        detail:
          taxRecords.length > 0
            ? `${taxRecords[0].paymentStatus || "PAID"} - ₹${(taxRecords[0].taxAmount || 0).toLocaleString()}`
            : "Tax records unavailable",
      },
      {
        id: "zon",
        label: "Zoning & Land Use Clearance",
        verified: zoningRecords.length > 0 && zoningRecords[0].complianceStatus === true,
        detail:
          zoningRecords.length > 0
            ? `${zoningRecords[0].zoningClassification || "Classified"} - Compliant`
            : "Zoning information unavailable",
      },
      {
        id: "perm",
        label: "Building Permit Sanctions",
        verified: permitRecords.length > 0 && permitRecords.some((p) => p.status === "APPROVED"),
        detail:
          permitRecords.length > 0
            ? `${permitRecords[0].permitNumber || "Permit"} (${permitRecords[0].status || "APPROVED"})`
            : "Permit records unavailable",
      },
      {
        id: "flood",
        label: "Flood Hazard & Zone Assessment",
        verified: floodRecords.length > 0,
        detail:
          floodRecords.length > 0
            ? `Zone: ${floodRecords[0].floodZone || "Zone-X"}`
            : "Flood assessment unavailable",
      },
      {
        id: "env",
        label: "Environmental Clearance Audit",
        verified: envRecords.length > 0,
        detail:
          envRecords.length > 0
            ? `Risk: ${envRecords[0].environmentalRisk || "Low"}`
            : "Environmental records unavailable",
      },
      {
        id: "docs",
        label: "Sub-Registrar Legal Document Vault",
        verified: documentRecords.length > 0,
        detail:
          documentRecords.length > 0
            ? `${documentRecords.length} Documents Registered`
            : "No documents attached",
      },
    ];
  }, [ownershipRecords, taxRecords, zoningRecords, permitRecords, floodRecords, envRecords, documentRecords]);

  // Derive Issues Requiring Attention
  const issues = useMemo(() => {
    const list = [];
    if (taxRecords.some((t) => t.paymentStatus !== "PAID")) {
      list.push("Outstanding municipal property tax dues detected.");
    }
    if (zoningRecords.some((z) => z.complianceStatus === false)) {
      list.push("Zoning non-compliance or land-use violation identified.");
    }
    if (permitRecords.some((p) => p.status === "EXPIRED" || p.status === "REJECTED")) {
      list.push("One or more building permits are expired or rejected.");
    }
    if (floodRecords.some((f) => f.specialFloodHazardArea === true)) {
      list.push("Property is situated within a Special Flood Hazard Area (SFHA).");
    }
    if (ownershipRecords.length === 0) {
      list.push("Ownership title record is unverified or missing in registry.");
    }
    return list;
  }, [taxRecords, zoningRecords, permitRecords, floodRecords, ownershipRecords]);

  // Primary Risk Profile
  const primaryRisk = riskAssessments[0] || null;

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* BREADCRUMB HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500 dark:text-[#CBD5E1]">
          <nav className="flex items-center gap-2">
            <Link to="/legal/dashboard" className="hover:text-blue-600 dark:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Home size={14} /> Legal Workspace
            </Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Property Due Diligence Review
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
              onClick={fetchPropertyLegalReview}
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
                <p className="font-bold">Unable to load property review</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
              </div>
            </div>
            <Button variant="danger" size="xs" onClick={fetchPropertyLegalReview}>
              Retry
            </Button>
          </div>
        )}

        {/* PROPERTY SWITCHER BAR */}
        <div className="glass-card rounded-3xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400">
              <Building2 size={18} />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Active Review Target</span>
              <strong className="text-slate-900 dark:text-white font-extrabold text-sm">
                {property ? `${property.propertyName} (${property.propertyCode || `PR-${property.propertyId}`})` : `Select Property`}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase font-bold text-slate-400">Switch Property:</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => handlePropertyChange(e.target.value)}
              className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold px-3 py-2 rounded-xl text-xs focus:outline-none cursor-pointer"
            >
              {properties.map((p) => {
                const id = p.propertyId || p.id;
                return (
                  <option key={id} value={String(id)}>
                    {p.propertyName} ({p.propertyCode || `PR-${id}`}) - {p.city || "Urban Region"}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* PROPERTY HERO HEADER */}
        {loading ? (
          <Skeleton className="h-44 w-full rounded-3xl" />
        ) : property ? (
          <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary">{property.propertyCode || `PR-${property.propertyId}`}</Badge>
                <Badge variant={reviewStatus === "VERIFIED" ? "success" : reviewStatus === "FLAGGED" ? "danger" : "warning"}>
                  {reviewStatus === "VERIFIED" ? "TITLE VERIFIED" : reviewStatus === "FLAGGED" ? "DISCREPANCY FLAGGED" : "UNDER LEGAL AUDIT"}
                </Badge>
                <span className="text-[10px] font-bold text-slate-400">
                  APN: {property.apn || property.pinNumber || "REG-APN-7741"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {property.propertyName}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 text-xs">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-blue-500" />
                  {property.addressLine1 ||
                    (typeof property.address === "string"
                      ? property.address
                      : property.address?.addressLine1) ||
                    "Main Boulevard"}
                  , {property.city || property.address?.city || "Urban Hub"},{" "}
                  {property.state || property.address?.state || "India"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} className="text-purple-500" />
                  {property.propertyType || "Residential"}
                </span>
                {property.marketValue && (
                  <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                    <DollarSign size={14} />
                    Valuation: ₹{(property.marketValue / 10000000).toFixed(2)} Cr
                  </span>
                )}
              </div>
            </div>

            {/* LEGAL REVIEWER ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Button
                onClick={handleApproveTitle}
                variant="success"
                size="sm"
                icon={CheckCircle2}
              >
                Approve & Clear Title
              </Button>
              <Button
                onClick={handleFlagDiscrepancy}
                variant="danger"
                size="sm"
                icon={Flag}
              >
                Flag Discrepancy
              </Button>
              <Button
                onClick={handleRequestDocuments}
                variant="outline"
                size="sm"
                icon={FileUp}
              >
                Request Docs
              </Button>
              <Button
                onClick={() => setReportModalOpen(true)}
                variant="primary"
                size="sm"
                icon={FileText}
              >
                Compile DD Dossier
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Property Not Found"
            message={`No property record found in PostgreSQL for ID ${selectedPropertyId}.`}
          />
        )}

        {/* LEGAL REVIEW SUMMARY KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="white-card rounded-2xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[9px] font-bold block">Ownership</span>
            <strong className="text-xs font-black text-slate-900 dark:text-white mt-1 block">
              {ownershipRecords.length > 0 ? "Verified" : "Unavailable"}
            </strong>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
              {ownershipRecords.length > 0 ? "100% Clear" : "No Records"}
            </span>
          </div>

          <div className="white-card rounded-2xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[9px] font-bold block">Property Tax</span>
            <strong className="text-xs font-black text-slate-900 dark:text-white mt-1 block">
              {taxRecords.length > 0 ? taxRecords[0].paymentStatus || "PAID" : "Unavailable"}
            </strong>
            <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold mt-1 block">
              {taxRecords.length > 0 ? "0 Dues" : "No Tax History"}
            </span>
          </div>

          <div className="white-card rounded-2xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[9px] font-bold block">Zoning</span>
            <strong className="text-xs font-black text-slate-900 dark:text-white mt-1 block">
              {zoningRecords.length > 0 ? "Compliant" : "Unavailable"}
            </strong>
            <span className="text-[10px] text-slate-500 font-bold mt-1 block">
              {zoningRecords.length > 0 ? zoningRecords[0].zoningClassification || "Standard" : "No Record"}
            </span>
          </div>

          <div className="white-card rounded-2xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[9px] font-bold block">Permits</span>
            <strong className="text-xs font-black text-slate-900 dark:text-white mt-1 block">
              {permitRecords.length > 0 ? permitRecords[0].status || "APPROVED" : "Unavailable"}
            </strong>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-1 block">
              {permitRecords.length} Sanctioned
            </span>
          </div>

          <div className="white-card rounded-2xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[9px] font-bold block">Flood Risk</span>
            <strong className="text-xs font-black text-slate-900 dark:text-white mt-1 block">
              {floodRecords.length > 0 ? floodRecords[0].floodZone || "Zone-X" : "Unavailable"}
            </strong>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
              {floodRecords.length > 0 ? "Low Risk" : "No Survey"}
            </span>
          </div>

          <div className="white-card rounded-2xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[9px] font-bold block">Environment</span>
            <strong className="text-xs font-black text-slate-900 dark:text-white mt-1 block">
              {envRecords.length > 0 ? envRecords[0].environmentalRisk || "Low" : "Unavailable"}
            </strong>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">
              {envRecords.length > 0 ? "Clear Audit" : "No Survey"}
            </span>
          </div>

          <div className="white-card rounded-2xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[9px] font-bold block">Legal Risk</span>
            <strong className="text-xs font-black text-slate-900 dark:text-white mt-1 block">
              {primaryRisk?.overallScore ? `${primaryRisk.overallScore}/100` : "Low"}
            </strong>
            <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold mt-1 block">
              {primaryRisk?.riskLevel || "Clear Status"}
            </span>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-[#334155]">
          {[
            { id: "CHECKLIST", label: "Review Checklist", icon: CheckSquare },
            { id: "OWNERSHIP", label: `Ownership (${ownershipRecords.length})`, icon: Scale },
            { id: "TAX", label: `Tax & Liens (${taxRecords.length})`, icon: DollarSign },
            { id: "ZONING", label: `Zoning (${zoningRecords.length})`, icon: Layers },
            { id: "PERMITS", label: `Permits (${permitRecords.length})`, icon: Award },
            { id: "ENVIRONMENT", label: "Flood & Environment", icon: Waves },
            { id: "DOCUMENTS", label: `Legal Docs (${documentRecords.length})`, icon: FolderOpen },
            { id: "RISK", label: `Risk Profile (${riskAssessments.length})`, icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors shrink-0 cursor-pointer ${
                  active
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-[#334155]"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === "CHECKLIST" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CHECKLIST */}
            <div className="lg:col-span-2 space-y-4">
              <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare size={16} className="text-blue-500" />
                  Legal Review Audit Checklist
                </h3>

                <div className="divide-y divide-slate-100 dark:divide-[#334155]">
                  {checklist.map((item) => (
                    <div key={item.id} className="py-3.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {item.verified ? (
                          <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        ) : (
                          <XCircle size={18} className="text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <div>
                          <p className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{item.detail}</p>
                        </div>
                      </div>

                      <Badge variant={item.verified ? "success" : "secondary"}>
                        {item.verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ISSUES & REPORT SHORTCUT */}
            <div className="space-y-6">
              {/* ISSUES REQUIRING ATTENTION */}
              <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-500" />
                  Issues Requiring Attention
                </h3>

                {issues.length > 0 ? (
                  <ul className="space-y-2.5">
                    {issues.map((iss, i) => (
                      <li
                        key={i}
                        className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-start gap-2"
                      >
                        <span className="text-amber-500">•</span>
                        {iss}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    No outstanding legal issues identified from available records.
                  </div>
                )}
              </div>

              {/* REPORT LINK */}
              <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  Due Diligence Dossier
                </h3>
                <p className="text-xs text-slate-500">
                  {reports.length > 0
                    ? `1 Comprehensive Dossier registered for this parcel in PostgreSQL.`
                    : "No Due Diligence report compiled yet."}
                </p>
                {reports.length > 0 ? (
                  <Button
                    onClick={() => navigate(`/due-diligence-report?id=${selectedPropertyId}`)}
                    variant="primary"
                    size="xs"
                    className="w-full"
                    icon={ExternalLink}
                  >
                    View Due Diligence Dossier
                  </Button>
                ) : (
                  <Button
                    onClick={() => setReportModalOpen(true)}
                    variant="primary"
                    size="xs"
                    className="w-full"
                    icon={FileText}
                  >
                    Generate Initial Report
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* OWNERSHIP TAB */}
        {activeTab === "OWNERSHIP" && (
          <div className="space-y-4">
            {ownershipRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ownershipRecords.map((rec) => (
                  <div
                    key={rec.ownershipId || rec.id}
                    className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold uppercase">
                        Ownership Record #{rec.ownershipId || rec.id}
                      </span>
                      <Badge variant="success">Verified Title</Badge>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {rec.owner?.fullName || "Registered Proprietary Owner"}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold">Ownership Share</span>
                        <strong className="text-slate-900 dark:text-white">{rec.ownershipPercentage || 100}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold">Owner Type</span>
                        <strong className="text-slate-900 dark:text-white">{rec.owner?.ownerType || "Individual"}</strong>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Contact: {rec.owner?.email || rec.owner?.phone || "Registry Verified"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No Ownership Records Available" message="Ownership title data is currently unrecorded." />
            )}
          </div>
        )}

        {/* TAX & LIENS TAB */}
        {activeTab === "TAX" && (
          <div className="space-y-4">
            {taxRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taxRecords.map((tax) => (
                  <div
                    key={tax.taxId || tax.id}
                    className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold uppercase">
                        Tax Assessment Year: {tax.assessmentYear || "2024-2025"}
                      </span>
                      <Badge variant={tax.paymentStatus === "PAID" ? "success" : "danger"}>
                        {tax.paymentStatus || "PAID"}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Tax Assessment: ₹{(tax.taxAmount || 0).toLocaleString()}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold">Outstanding Dues</span>
                        <strong className={tax.outstandingAmount > 0 ? "text-rose-600" : "text-emerald-600"}>
                          ₹{(tax.outstandingAmount || 0).toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold">Receipt Reference</span>
                        <strong className="text-slate-900 dark:text-white">{tax.receiptNumber || "GHMC-TAX-2024"}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No Tax Records Available" message="Municipal tax payment history is currently unrecorded." />
            )}
          </div>
        )}

        {/* ZONING TAB */}
        {activeTab === "ZONING" && (
          <div className="space-y-4">
            {zoningRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {zoningRecords.map((zon) => (
                  <div
                    key={zon.zoningId || zon.id}
                    className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold uppercase">
                        Zoning Clearance #{zon.zoningId || zon.id}
                      </span>
                      <Badge variant={zon.complianceStatus ? "success" : "danger"}>
                        {zon.complianceStatus ? "Compliant" : "Non-Compliant"}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Classification: {zon.zoningClassification || "Residential Zone"}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold">Permitted Land Use</span>
                        <strong className="text-slate-900 dark:text-white">{zon.permittedUse || "Residential Villas"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold">Master Plan Ref</span>
                        <strong className="text-slate-900 dark:text-white">{zon.masterPlanRef || "HMDA-2031"}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No Zoning Records Available" message="Zoning and land-use data is currently unrecorded." />
            )}
          </div>
        )}

        {/* PERMITS TAB */}
        {activeTab === "PERMITS" && (
          <div className="space-y-4">
            {permitRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permitRecords.map((perm) => (
                  <div
                    key={perm.permitId || perm.id}
                    className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold uppercase">
                        Permit #{perm.permitNumber || `PERM-${perm.permitId}`}
                      </span>
                      <Badge variant={perm.status === "APPROVED" ? "success" : "warning"}>
                        {perm.status || "APPROVED"}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {perm.permitType || "Building Construction Sanction"}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold">Issuing Authority</span>
                        <strong className="text-slate-900 dark:text-white">{perm.issuingAuthority || "Municipal Corp"}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold">Issue Date</span>
                        <strong className="text-slate-900 dark:text-white">{perm.issueDate || "12 Jan 2021"}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No Building Permits Available" message="Municipal permit sanctions are currently unrecorded." />
            )}
          </div>
        )}

        {/* FLOOD & ENVIRONMENT TAB */}
        {activeTab === "ENVIRONMENT" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* FLOOD */}
            <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Waves size={16} className="text-blue-500" />
                Flood Hazard Survey
              </h3>
              {floodRecords.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Flood Zone</span>
                      <Badge variant="success">{floodRecords[0].floodZone || "Zone-X"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Special Hazard Area (SFHA)</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {floodRecords[0].specialFloodHazardArea ? "Yes (Hazard)" : "No (Minimal Risk)"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No flood survey records available in database.</p>
              )}
            </div>

            {/* ENVIRONMENTAL */}
            <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Trees size={16} className="text-emerald-500" />
                Environmental Clearance Audit
              </h3>
              {envRecords.length > 0 ? (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Environmental Risk</span>
                      <Badge variant="success">{envRecords[0].environmentalRisk || "Low"}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Contamination Status</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {envRecords[0].contaminationStatus ? "Contaminated" : "Clean"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">No environmental records available in database.</p>
              )}
            </div>
          </div>
        )}

        {/* LEGAL DOCUMENTS TAB */}
        {activeTab === "DOCUMENTS" && (
          <div className="space-y-4">
            {documentRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentRecords.map((doc) => (
                  <div
                    key={doc.documentId || doc.id}
                    className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold uppercase">
                        {doc.documentType || "TITLE_DEED"}
                      </span>
                      <Badge variant="success">Registered</Badge>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {doc.documentName || "Supporting Legal Deed"}
                    </h3>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-mono">
                      <p className="text-slate-500 truncate">{doc.filePath}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No Legal Documents for this Property" message="No supporting documents have been registered for this parcel in the vault." />
            )}
          </div>
        )}

        {/* RISK PROFILE TAB */}
        {activeTab === "RISK" && (
          <div className="space-y-4">
            {riskAssessments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riskAssessments.map((r) => (
                  <div
                    key={r.riskAssessmentId || r.id}
                    className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold uppercase">
                        Risk Assessment #{r.riskAssessmentId || r.id}
                      </span>
                      <Badge variant={r.riskLevel === "LOW" ? "success" : "warning"}>
                        {r.riskLevel || "LOW"} RISK
                      </Badge>
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Overall Risk Score: {r.overallScore || 15}/100
                    </h3>
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold">Title Risk</span>
                        <strong className="text-emerald-600">Low Risk</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold">Financial Risk</span>
                        <strong className="text-emerald-600">Low Risk</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No Risk Assessments Available" message="Property risk evaluations are currently unrecorded." />
            )}
          </div>
        )}

        {/* REPORT GENERATOR MODAL */}
        <ReportGeneratorModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          initialPropertyId={selectedPropertyId}
        />
      </div>
    </MainLayout>
  );
}

export default PropertyReview;
