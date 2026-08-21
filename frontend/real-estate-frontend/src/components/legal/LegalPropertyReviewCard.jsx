import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  User,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  Eye,
  FileText,
  FileDown,
  FolderCheck,
  ImageOff,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Badge from "../common/Badge";

function LegalPropertyReviewCard({ property, onGenerateReport }) {
  const navigate = useNavigate();
  const p = property || {};
  const imgSrc = p.imageUrl || p.image || null;

  const numericId = p.numericId || p.propertyId || p.id || "1001";
  const displayPrice = p.displayPrice || (p.marketValue ? `₹ ${(p.marketValue / 10000000).toFixed(2)} Cr` : "₹ 45.00 Cr");
  const ownerName = p.ownerName || p.owner || "Adani Realty Institutional Fund";
  const legalStatus = p.titleVerificationStatus || p.status || "Verified Clear Title";
  const riskScore = p.riskScore ?? 14;
  const riskLevel = p.riskLevel || (riskScore > 50 ? "High Risk" : "Low Risk");

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="white-card rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* 1. PROPERTY IMAGE */}
        <div className="h-48 relative bg-slate-100 dark:bg-[#0F172A] overflow-hidden flex items-center justify-center">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={p.propertyName || p.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-1">
              <ImageOff size={32} />
              <span className="text-[11px] font-mono font-bold">No Image Available</span>
            </div>
          )}

          {/* Badges Overlaid on Image */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono font-bold bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg border border-white/20">
              PR-{numericId}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <Badge variant={riskScore > 50 ? "danger" : "success"}>
              {riskLevel} ({riskScore}/100)
            </Badge>
          </div>
        </div>

        {/* PROPERTY DETAILS CONTENT */}
        <div className="p-5 space-y-4 font-mono text-xs">
          {/* 2. PROPERTY NAME & LEGAL STATUS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-cyan-400">
                {p.propertyType || "Commercial Office"}
              </span>
              <Badge variant={legalStatus.includes("Clear") ? "success" : "warning"}>
                {legalStatus}
              </Badge>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-1">
              {p.propertyName || p.title || "Gachibowli Tech Park Phase 2"}
            </h3>

            {/* 3. ADDRESS */}
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium truncate">
              <MapPin size={13} className="text-blue-500 shrink-0" />
              <span className="truncate">{p.address || "Financial District, Hyderabad"}</span>
            </p>
          </div>

          {/* 4. OWNER & 5. MARKET VALUE */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Recorded Owner</span>
              <strong className="text-slate-900 dark:text-white font-extrabold text-xs block truncate" title={ownerName}>
                👤 {ownerName}
              </strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Market Valuation</span>
              <strong className="text-blue-600 dark:text-cyan-400 font-extrabold text-xs block">
                💰 {displayPrice}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* THE 4 REQUIRED ACTION BUTTONS */}
      <div className="p-5 pt-0 grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-[#334155] mt-2 text-xs font-mono">
        {/* 1. View Details */}
        <button
          onClick={() => navigate(`/property-details?id=${numericId}`)}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-800 dark:text-slate-200 font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
          title="View full 9-tab property workstation"
        >
          <Eye size={13} /> <span>View Details</span>
        </button>

        {/* 2. Review Ownership */}
        <button
          onClick={() => navigate(`/ownership?id=${numericId}`)}
          className="px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold transition-all flex items-center justify-center gap-1 border border-purple-200 dark:border-purple-800 cursor-pointer"
          title="Inspect 30-year title deed chain"
        >
          <ShieldCheck size={13} /> <span>Ownership</span>
        </button>

        {/* 3. Verify Documents */}
        <button
          onClick={() => navigate(`/documents?id=${numericId}`)}
          className="px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-cyan-300 font-bold transition-all flex items-center justify-center gap-1 border border-blue-200 dark:border-blue-800 cursor-pointer"
          title="Audit legal document vault"
        >
          <FolderCheck size={13} /> <span>Documents</span>
        </button>

        {/* 4. Generate Report */}
        <button
          onClick={() => onGenerateReport(numericId)}
          className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold transition-all flex items-center justify-center gap-1 border border-emerald-200 dark:border-emerald-800 cursor-pointer"
          title="Generate 13-vector audit report PDF"
        >
          <FileDown size={13} /> <span>Report</span>
        </button>
      </div>
    </motion.div>
  );
}

export default LegalPropertyReviewCard;
