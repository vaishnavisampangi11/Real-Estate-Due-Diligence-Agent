import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import PropertyContextSwitcher from "../components/common/PropertyContextSwitcher";
import { getLiveActiveProperty } from "../services/liveStore";
import { getPropertyDetails } from "../services/propertyService";
import {
  Landmark,
  User,
  Building2,
  DollarSign,
  CreditCard,
  ShieldAlert,
  Award,
  Receipt,
  FileText,
  CheckCircle2,
  XCircle,
  FileQuestion,
  FileSpreadsheet,
  Download,
  Eye,
  X,
  MapPin,
  Percent,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Layers,
  Check,
} from "lucide-react";
import { exportToPdf } from "../utils/exportUtils";
import { showSuccessAlert, showConfirmAlert, showToast } from "../utils/swal";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";

function LoanReview() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const propertyIdParam = searchParams.get("id") || searchParams.get("propertyId") || localStorage.getItem("active_property_id") || "1";
  const numericId = propertyIdParam.toString().replace(/\D/g, "") || "1";

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loanStatus, setLoanStatus] = useState("Under Review");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("Incomplete Collateral Documentation");
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [requestedDocsList, setRequestedDocsList] = useState(["Latest Certified Audited Balance Sheet", "Environmental Impact Assessment NOC"]);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    const fetchDossier = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getPropertyDetails(numericId);
        setProperty(res);
      } catch (err) {
        console.error("Failed to load loan dossier:", err);
        setError("Unable to load loan dossier. Please verify backend is running on port 8081.");
      } finally {
        setLoading(false);
      }
    };
    fetchDossier();
  }, [numericId]);

  const pName = property?.propertyName || property?.title || `Property Parcel PR-${numericId}`;
  const pCode = property?.propertyCode || `PR-${numericId}`;
  const mv = Number(property?.marketValue || 450000000);
  const crVal = mv >= 10000000 ? `₹ ${(mv / 10000000).toFixed(2)} Cr` : `₹ ${(mv / 100000).toFixed(2)} Lakhs`;
  const sanction = mv * 0.7;
  const sanctionVal = sanction >= 10000000 ? `₹ ${(sanction / 10000000).toFixed(2)} Cr` : `₹ ${(sanction / 100000).toFixed(2)} Lakhs`;

  const loanData = {
    loanId: `LN-HYD-2026-${String(numericId).padStart(3, "0")}`,
    applicant: {
      name: "Adani Realty Institutional Fund",
      entityType: "Private Limited Corporation",
      panGstin: "36AABCA1234F1Z9",
      creditScore: 820,
      maxCreditScore: 900,
      creditRatingLabel: "Commercial CIBIL Prime",
      netWorth: "₹ 450.00 Cr",
      email: "capital@adani.com",
      phone: "+91 98200 11223",
    },
    property: {
      name: pName,
      apn: `APN-${pCode}`,
      address: property?.address?.city ? `${property.address.addressLine1 || ""}, ${property.address.city}, ${property.address.state || ""}` : (property?.address || "Financial District, Hyderabad"),
      city: property?.address?.city || "Hyderabad",
      propertyType: property?.propertyType || "Commercial Office",
      builtArea: "45,000 sq ft",
      titleStatus: property?.status === "VERIFIED" ? "Verified Clear Title" : "Pending Title Verification",
      imgUrl: property?.imageUrl || FALLBACK_IMAGE,
    },
    requestedAmount: {
      sanctionAmount: sanctionVal,
      ltvRatio: "70.0%",
      ltvPercent: 70.0,
      interestRate: "9.25% p.a. (Floating)",
      tenor: "15 Years (180 Months)",
      monthlyEmi: "₹ 25.60 Lakhs / month",
    },
    creditSummary: {
      cibilScore: "820 (Prime Excellent)",
      dscrRatio: "1.85x Coverage",
      dscrValue: 1.85,
      existingDebt: "₹ 12.50 Cr",
      repaymentHistory: "100% On-Time (Zero Default)",
    },
    riskScore: {
      scoreNum: property?.status === "VERIFIED" ? 14 : 35,
      scoreText: property?.status === "VERIFIED" ? "14/100 (Low Risk)" : "35/100 (Moderate Risk)",
      level: property?.status === "VERIFIED" ? "Low Risk" : "Moderate Risk",
      verdict: "Sanction Highly Recommended",
      badges: ["Low Default Risk", "High Collateral Coverage", "Prime Financial Location"],
    },
    propertyValuation: {
      marketValue: crVal,
      govtValue: `₹ ${(mv * 0.75 / 10000000).toFixed(2)} Cr`,
      ltvBuffer: "30.0% Equity Margin",
      appraiser: "Knight Frank Institutional Valuation",
    },
    taxVerification: {
      clearanceStatus: "Zero Dues Verified",
      outstandingDues: "₹ 0.00",
      ptinNumber: `PTIN-HYD-2026-${numericId}`,
      lastPaidDate: "15 Mar 2026",
    },
    documents: [
      { id: "DOC-101", title: "Certified Sub-Registrar Title Deed", type: "PDF", size: "3.4 MB", status: "Verified", date: "12 Apr 2026" },
      { id: "DOC-102", title: "Commercial Occupancy Certificate (OC)", type: "PDF", size: "2.1 MB", status: "Verified", date: "18 Apr 2026" },
      { id: "DOC-103", title: "5-Year Municipal Tax Clearance Cert", type: "PDF", size: "1.8 MB", status: "Verified", date: "22 Apr 2026" },
      { id: "DOC-104", title: "Independent Collateral Valuation Dossier", type: "PDF", size: "4.5 MB", status: "Verified", date: "28 Apr 2026" },
    ],
  };

  // THE 4 REQUIRED BUTTON HANDLERS
  // 1. Approve Loan
  const handleApproveLoan = async () => {
    const confirmed = await showConfirmAlert(
      "Approve Commercial Loan Sanction?",
      `Confirm formal underwriting approval for ${loanData.requestedAmount.sanctionAmount} to ${loanData.applicant.name}?`
    );
    if (confirmed) {
      setLoanStatus("Approved");
      showSuccessAlert("Loan Approved & Sanctioned", `Loan ${loanData.loanId} approved for ${loanData.requestedAmount.sanctionAmount}`);
    }
  };

  // 2. Reject Loan
  const handleRejectLoanConfirm = () => {
    setLoanStatus("Rejected");
    setRejectModalOpen(false);
    showSuccessAlert("Loan Application Rejected", `Loan ${loanData.loanId} rejected. Reason: ${rejectReason}`);
  };

  // 3. Request Additional Documents
  const handleSendDocRequest = () => {
    setDocsModalOpen(false);
    showSuccessAlert("Document Request Dispatched", `Sent formal request for ${requestedDocsList.length} additional documents to ${loanData.applicant.email}`);
  };

  // 4. Generate Financial Report
  const handleGenerateFinancialReport = () => {
    exportToPdf(`Loan_Underwriting_Report_${loanData.loanId}`, loanData);
    showSuccessAlert("Financial Underwriting Report Exported", `Generated PDF report for ${loanData.loanId}`);
  };

  // Helper for Status Badge Variant
  const getStatusVariant = (status) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "danger";
      default: return "warning";
    }
  };

  // Pipeline Stages Config
  const pipelineStages = [
    { label: "1. Application Filed", status: "completed", date: "10 Apr 2026" },
    { label: "2. Legal & Tax Diligence", status: "completed", date: "24 Apr 2026" },
    { label: "3. Underwriting Review", status: loanStatus === "Under Review" ? "active" : "completed", date: "02 Aug 2026" },
    { label: "4. Formal Sanction", status: loanStatus === "Approved" ? "completed" : loanStatus === "Rejected" ? "rejected" : "pending", date: loanStatus === "Approved" ? "05 Aug 2026" : "Pending" },
  ];

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <Landmark size={14} className="text-blue-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Commercial Loan Application Underwriting Dossier
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-800">
              DOSSIER • {loanData.loanId}
            </span>
            <Badge variant={getStatusVariant(loanStatus)}>
              {loanStatus}
            </Badge>
          </div>
        </div>

        {/* PROPERTY CONTEXT SWITCHER BAR */}
        <PropertyContextSwitcher currentPropertyId={numericId} />

        {/* TOP UNDERWRITING PIPELINE PROGRESS STEPPER */}
        <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {pipelineStages.map((stage, idx) => {
              const isDone = stage.status === "completed";
              const isActive = stage.status === "active";
              const isRejected = stage.status === "rejected";
              return (
                <div key={idx} className="flex-1 flex items-center gap-3 w-full">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isDone ? "bg-emerald-500 text-white shadow-xs" :
                    isActive ? "bg-blue-600 text-white ring-4 ring-blue-500/20" :
                    isRejected ? "bg-rose-600 text-white" :
                    "bg-slate-200 dark:bg-slate-800 text-slate-400"
                  }`}>
                    {isDone ? <Check size={16} /> : idx + 1}
                  </div>

                  <div className="min-w-0">
                    <h3 className={`font-extrabold text-xs truncate ${
                      isActive || isDone ? "text-slate-900 dark:text-white" : "text-slate-400"
                    }`}>
                      {stage.label}
                    </h3>
                    <span className="text-[10px] text-slate-400 block">{stage.date}</span>
                  </div>

                  {idx < pipelineStages.length - 1 && (
                    <div className="hidden lg:block flex-1 h-0.5 bg-slate-200 dark:bg-slate-800 mx-2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLLATERAL SHOWCASE HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-[#334155] bg-slate-900">
          <img
            src={loanData.property.imgUrl || FALLBACK_IMAGE}
            alt={loanData.property.name}
            className="w-full h-48 sm:h-64 object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6 sm:p-8 flex flex-col justify-end">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/30">
                    {loanData.property.apn}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                    {loanData.property.city}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {loanData.property.name}
                </h1>
                <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-1 font-medium">
                  <MapPin size={14} className="text-blue-400 shrink-0" />
                  <span>{loanData.property.address}</span>
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sanction Requested</span>
                  <span className="text-xl font-black text-emerald-400">{loanData.requestedAmount.sanctionAmount}</span>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Fair Market Value</span>
                  <span className="text-xl font-black text-cyan-300">{loanData.propertyValuation.marketValue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* HERO ACTION BAR (THE 4 REQUIRED BUTTONS) */}
        <div className="glass-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-sm">
            <Sparkles size={18} className="text-blue-500" />
            <span>Underwriting Actions Workstation</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1. Approve Loan */}
            <Button onClick={handleApproveLoan} variant="primary" size="sm" icon={CheckCircle2}>
              Approve Loan
            </Button>

            {/* 2. Reject Loan */}
            <Button onClick={() => setRejectModalOpen(true)} variant="danger" size="sm" icon={XCircle}>
              Reject Loan
            </Button>

            {/* 3. Request Additional Documents */}
            <Button onClick={() => setDocsModalOpen(true)} variant="outline" size="sm" icon={FileQuestion}>
              Request Additional Documents
            </Button>

            {/* 4. Generate Financial Report */}
            <Button onClick={handleGenerateFinancialReport} variant="secondary" size="sm" icon={FileSpreadsheet}>
              Generate Financial Report
            </Button>
          </div>
        </div>

        {/* 3 RADIAL SVG GAUGE CARDS (CIBIL SCORE, RISK INDEX, DSCR COVERAGE) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Gauge 1: Commercial CIBIL Score */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider block">
                CREDIT ASSESSMENT
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                Commercial CIBIL Score
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1">{loanData.applicant.creditRatingLabel}</p>
            </div>

            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-200 dark:text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-blue-500" strokeDasharray={`${(loanData.applicant.creditScore / 900) * 100}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-black text-slate-900 dark:text-white block leading-none">{loanData.applicant.creditScore}</span>
                <span className="text-[8px] text-slate-400 font-bold">/ 900</span>
              </div>
            </div>
          </div>

          {/* Gauge 2: 13-Vector Risk Index */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                COLLATERAL RISK
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                13-Vector Risk Index
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1">{loanData.riskScore.verdict}</p>
            </div>

            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-200 dark:text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className={loanData.riskScore.scoreNum > 50 ? "text-rose-500" : "text-emerald-500"} strokeDasharray={`${loanData.riskScore.scoreNum}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-black text-slate-900 dark:text-white block leading-none">{loanData.riskScore.scoreNum}</span>
                <span className="text-[8px] text-slate-400 font-bold">/ 100</span>
              </div>
            </div>
          </div>

          {/* Gauge 3: DSCR Debt Coverage Ratio */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                DEBT SERVICE DSCR
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                Cash Flow DSCR Ratio
              </h3>
              <p className="text-xs text-slate-500 font-bold mt-1">{loanData.creditSummary.dscrRatio}</p>
            </div>

            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-slate-200 dark:text-slate-800" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-emerald-500" strokeDasharray={`${(loanData.creditSummary.dscrValue / 2.5) * 100}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-black text-slate-900 dark:text-white block leading-none">{loanData.creditSummary.dscrValue}x</span>
                <span className="text-[8px] text-slate-400 font-bold">DSCR</span>
              </div>
            </div>
          </div>
        </div>

        {/* PERFECTLY BALANCED 2-COLUMN ORDERED GRID (SECTIONS 1 TO 8) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* ROW 1 - LEFT: 1. APPLICANT INFORMATION */}
          <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <User size={18} className="text-blue-500" /> 1. Applicant Information
              </h2>
              <Badge variant="info">{loanData.applicant.entityType}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs flex-1">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Applicant Legal Name</span>
                <strong className="text-slate-900 dark:text-white text-sm">{loanData.applicant.name}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">PAN / GSTIN Ref</span>
                <strong className="text-blue-600 dark:text-cyan-400 font-mono text-sm">{loanData.applicant.panGstin}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Corporate Net Worth</span>
                <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{loanData.applicant.netWorth}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Channel</span>
                <span className="text-slate-900 dark:text-white font-bold">{loanData.applicant.email} • {loanData.applicant.phone}</span>
              </div>
            </div>
          </div>

          {/* ROW 1 - RIGHT: 2. PROPERTY INFORMATION */}
          <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 size={18} className="text-purple-500" /> 2. Collateral Property Information
              </h2>
              <Badge variant="success">{loanData.property.titleStatus}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs flex-1">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Property Parcel Name</span>
                <strong className="text-slate-900 dark:text-white text-sm">{loanData.property.name}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">APN Parcel Number</span>
                <strong className="text-purple-600 dark:text-purple-400 font-mono text-sm">{loanData.property.apn}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] sm:col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Address & Location</span>
                <span className="text-slate-900 dark:text-white font-bold flex items-center gap-1 mt-0.5">
                  <MapPin size={14} className="text-slate-400" /> {loanData.property.address}
                </span>
              </div>
            </div>
          </div>

          {/* ROW 2 - LEFT: 3. REQUESTED AMOUNT */}
          <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-500" /> 3. Requested Amount & Facility Terms
              </h2>
              <Badge variant="primary">LTV {loanData.requestedAmount.ltvRatio}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs flex-1">
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Sanction Amount</span>
                <strong className="text-emerald-600 dark:text-emerald-400 text-lg font-black">{loanData.requestedAmount.sanctionAmount}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Interest Rate & Tenor</span>
                <strong className="text-blue-600 dark:text-cyan-300 text-xs block font-bold">{loanData.requestedAmount.interestRate}</strong>
                <span className="block text-[10px] text-slate-400 font-bold">{loanData.requestedAmount.tenor}</span>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Estimated Monthly EMI</span>
                <strong className="text-purple-600 dark:text-purple-300 text-xs font-black">{loanData.requestedAmount.monthlyEmi}</strong>
              </div>
            </div>
          </div>

          {/* ROW 2 - RIGHT: 4. CREDIT SUMMARY */}
          <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard size={18} className="text-blue-500" /> 4. Commercial Credit Summary
              </h2>
              <Badge variant="success">DSCR {loanData.creditSummary.dscrRatio}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs flex-1">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Commercial CIBIL Credit Score</span>
                <strong className="text-blue-600 dark:text-cyan-400 text-sm">{loanData.creditSummary.cibilScore}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Debt Service Coverage Ratio (DSCR)</span>
                <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{loanData.creditSummary.dscrRatio}</strong>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] sm:col-span-2">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Repayment Track Record</span>
                <strong className="text-slate-900 dark:text-white text-xs">{loanData.creditSummary.repaymentHistory}</strong>
              </div>
            </div>
          </div>

          {/* ROW 3 - LEFT: 5. RISK SCORE */}
          <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-500" /> 5. Underwriting Risk Score
              </h2>
              <Badge variant={loanData.riskScore.scoreNum > 50 ? "danger" : "success"}>{loanData.riskScore.level}</Badge>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3 text-center flex-1 flex flex-col justify-center">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">13-Vector Risk Index</span>
              <strong className="text-3xl font-black text-blue-600 dark:text-cyan-400 block">{loanData.riskScore.scoreText}</strong>
              <p className="text-slate-500 text-[11px] font-bold">{loanData.riskScore.verdict}</p>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {loanData.riskScore.badges.map((b, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 3 - RIGHT: 6. PROPERTY VALUATION */}
          <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Award size={18} className="text-emerald-500" /> 6. Property Valuation
              </h2>
            </div>

            <div className="space-y-3 font-mono text-xs flex-1 flex flex-col justify-center">
              <div className="flex justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
                <span className="text-slate-400">Fair Market Value:</span>
                <strong className="text-blue-600 dark:text-cyan-400">{loanData.propertyValuation.marketValue}</strong>
              </div>

              <div className="flex justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
                <span className="text-slate-400">Govt Ready Reckoner:</span>
                <strong className="text-slate-900 dark:text-white">{loanData.propertyValuation.govtValue}</strong>
              </div>

              <div className="flex justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
                <span className="text-slate-400">Equity LTV Buffer:</span>
                <strong className="text-emerald-600 dark:text-emerald-400">{loanData.propertyValuation.ltvBuffer}</strong>
              </div>
            </div>
          </div>

          {/* ROW 4 - LEFT: 7. TAX VERIFICATION */}
          <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Receipt size={18} className="text-blue-500" /> 7. Tax Verification
              </h2>
              <Badge variant="success">{loanData.taxVerification.clearanceStatus}</Badge>
            </div>

            <div className="space-y-3 font-mono text-xs flex-1 flex flex-col justify-center">
              <div className="flex justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
                <span className="text-slate-400">Tax Clearance Status:</span>
                <Badge variant="success">{loanData.taxVerification.clearanceStatus}</Badge>
              </div>

              <div className="flex justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
                <span className="text-slate-400">Outstanding Dues:</span>
                <strong className="text-slate-900 dark:text-white">{loanData.taxVerification.outstandingDues}</strong>
              </div>

              <div className="flex justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A]">
                <span className="text-slate-400">Municipal PTIN Ref:</span>
                <strong className="text-blue-600 dark:text-cyan-400">{loanData.taxVerification.ptinNumber}</strong>
              </div>
            </div>
          </div>

          {/* ROW 4 - RIGHT: 8. DOCUMENTS */}
          <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-purple-500" /> 8. Verified Documents ({loanData.documents.length})
              </h2>
            </div>

            <div className="space-y-2.5 font-mono text-xs flex-1">
              {loanData.documents.map((doc) => (
                <div key={doc.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate">{doc.title}</h3>
                    <span className="text-[10px] text-slate-400">{doc.id} • {doc.size}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => setPreviewDoc(doc)} className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-300 hover:bg-blue-100 cursor-pointer" title="Preview Document"><Eye size={14} /></button>
                    <button onClick={() => showToast(`Downloading ${doc.title}`, "success")} className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-100 cursor-pointer" title="Download PDF"><Download size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL 1: DOCUMENT PREVIEW MODAL */}
        <AnimatePresence>
          {previewDoc && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewDoc(null)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-lg w-full space-y-6 font-mono text-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText size={20} className="text-blue-500" /> Document Viewer
                  </h2>
                  <button onClick={() => setPreviewDoc(null)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                    <p className="text-slate-500">Document Ref: <strong className="text-blue-600 dark:text-cyan-400">{previewDoc.id}</strong></p>
                    <p className="text-slate-500">Title: <strong className="text-slate-900 dark:text-white">{previewDoc.title}</strong></p>
                    <p className="text-slate-500">Upload Date: <strong className="text-slate-400">{previewDoc.date}</strong></p>
                    <p className="text-slate-500">Audit Status: <strong className="text-emerald-600 dark:text-emerald-400">{previewDoc.status}</strong></p>
                  </div>

                  <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[#334155] text-center space-y-2 bg-slate-50/50 dark:bg-[#0F172A]/50">
                    <ShieldCheck size={32} className="mx-auto text-emerald-500" />
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-xs">OFFICIAL SUB-REGISTRAR WATERMARK SEAL</h3>
                    <p className="text-slate-400 text-[10px]">Verified digital signature digest matching Telangana Land Registry Master Database.</p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                    <Button onClick={() => setPreviewDoc(null)} variant="secondary" size="sm">Close</Button>
                    <Button onClick={() => { setPreviewDoc(null); showToast(`Downloaded ${previewDoc.title}`, "success"); }} variant="primary" size="sm" icon={Download}>Download PDF</Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MODAL 2: REJECT LOAN APPLICATION */}
        <AnimatePresence>
          {rejectModalOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setRejectModalOpen(false)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6 font-mono text-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <h2 className="text-lg font-extrabold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <XCircle size={20} /> Reject Commercial Loan Application
                  </h2>
                  <button onClick={() => setRejectModalOpen(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300">Select formal reason for rejecting loan application <strong>{loanData.loanId}</strong>:</p>

                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] p-3 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Incomplete Collateral Documentation">Incomplete Collateral Documentation</option>
                    <option value="High LTV Collateral Deficit">High LTV Collateral Deficit</option>
                    <option value="Unresolved Municipal Tax Lien">Unresolved Municipal Tax Lien</option>
                    <option value="Insufficient Debt Coverage (Low DSCR)">Insufficient Debt Coverage (Low DSCR)</option>
                  </select>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                    <Button onClick={() => setRejectModalOpen(false)} variant="secondary" size="sm">Cancel</Button>
                    <Button onClick={handleRejectLoanConfirm} variant="danger" size="sm" icon={XCircle}>Confirm Rejection</Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* MODAL 3: REQUEST ADDITIONAL DOCUMENTS */}
        <AnimatePresence>
          {docsModalOpen && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDocsModalOpen(false)} className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md" />
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6 font-mono text-xs">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileQuestion size={20} className="text-purple-500" /> Request Additional Documents
                  </h2>
                  <button onClick={() => setDocsModalOpen(false)} className="p-2 text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
                </div>

                <div className="space-y-4">
                  <p className="text-slate-600 dark:text-slate-300">Dispatches formal document requisition notice to <strong>{loanData.applicant.email}</strong>:</p>

                  <div className="space-y-2">
                    {["Latest Certified Audited Balance Sheet", "Environmental Impact Assessment NOC", "Updated Municipal Tax Clearance Receipt"].map((docName, idx) => (
                      <label key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] cursor-pointer">
                        <input type="checkbox" defaultChecked className="rounded text-purple-600 focus:ring-purple-500" />
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{docName}</span>
                      </label>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex justify-end gap-3">
                    <Button onClick={() => setDocsModalOpen(false)} variant="secondary" size="sm">Cancel</Button>
                    <Button onClick={handleSendDocRequest} variant="primary" size="sm" icon={FileQuestion}>Dispatch Request</Button>
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

export default LoanReview;
