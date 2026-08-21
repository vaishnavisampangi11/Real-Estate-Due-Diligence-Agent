import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  FileDown,
  ArrowLeftRight,
  Trash2,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Tag,
} from "lucide-react";
import Badge from "../common/Badge";
import { setLiveActiveProperty, toggleSaveProperty } from "../../services/liveStore";
import { showToast } from "../../utils/swal";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";

function SavedPropertyCard({ property, onGenerateReport, onRemove }) {
  const navigate = useNavigate();
  const p = property || {};

  const numericId = (p.numericId || p.propertyId || p.id || "1001").toString().replace(/\D/g, "") || "1001";
  const propertyIdFormatted = p.id && p.id.startsWith("PR-") ? p.id : `PR-${numericId}`;
  const propertyName = p.propertyName || p.title || p.name || "Commercial Property Parcel";
  
  const address =
    typeof p.address === "object" && p.address !== null
      ? `${p.address.addressLine1 || ""}${p.address.city ? `, ${p.address.city}` : ""}`
      : p.address || `${propertyName}, ${p.city || "Hyderabad"}`;

  const marketValue =
    typeof p.marketValue === "number"
      ? `₹ ${(p.marketValue / 10000000).toFixed(2)} Cr`
      : p.marketValue || p.displayPrice || p.price || "₹ 25.00 Cr";

  const riskScore = p.riskScore ?? 14;
  const status = p.status || p.titleVerificationStatus || "Verified Clear Title";
  const imgSrc = p.imageUrl || p.image || p.imgSrc || FALLBACK_IMAGE;

  const handleViewDetails = (e) => {
    e.stopPropagation();
    setLiveActiveProperty(numericId);
    navigate(`/property-details?id=${numericId}`);
  };

  const handleCompare = (e) => {
    e.stopPropagation();
    setLiveActiveProperty(numericId);
    navigate(`/comparable-properties?id=${numericId}`);
  };

  const handleGenerateReportClick = (e) => {
    e.stopPropagation();
    setLiveActiveProperty(numericId);
    if (onGenerateReport) {
      onGenerateReport(p);
    } else {
      navigate(`/due-diligence-report?id=${numericId}`);
    }
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    toggleSaveProperty(p);
    showToast(`Removed "${propertyName}" from saved watchlist`, "info");
    if (onRemove) onRemove(p);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="white-card rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
    >
      {/* 1. Property Image Banner + Overlays */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-[#0F172A]">
        <img
          src={imgSrc}
          alt={propertyName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* Top Badges: ID + Risk */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-cyan-400 font-mono font-extrabold text-[11px] border border-slate-700/60 shadow-md">
            {propertyIdFormatted}
          </span>
          <Badge variant={riskScore > 60 ? "danger" : "success"}>
            {riskScore > 60 ? "High Risk" : "Low Risk"} ({100 - riskScore}/100)
          </Badge>
        </div>

        {/* Bottom Banner Title */}
        <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
          <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider block">
            {p.type || p.category || "Commercial Property"}
          </span>
          <h3 className="text-sm font-extrabold truncate drop-shadow-md">
            {propertyName}
          </h3>
        </div>
      </div>

      {/* 2. Card Content Details */}
      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          {/* Address */}
          <p className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-1.5 line-clamp-2 leading-relaxed">
            <MapPin size={14} className="text-blue-500 dark:text-cyan-400 shrink-0 mt-0.5" />
            <span>{address}</span>
          </p>

          {/* Metrics Grid: Market Value & Status */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-100 dark:border-[#334155] grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase block">
                Market Value
              </span>
              <strong className="font-mono font-extrabold text-blue-600 dark:text-cyan-400 text-xs">
                {marketValue}
              </strong>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase block">
                Verification Status
              </span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate block">
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Four Reusable Action Buttons Grid */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#334155] grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Button 1: View Details */}
          <button
            onClick={handleViewDetails}
            title="View full parcel inspection details"
            className="w-full py-2 px-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 hover:text-white text-blue-700 dark:text-cyan-300 font-bold text-[11px] border border-blue-200 dark:border-blue-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <Eye size={12} />
            <span>Details</span>
          </button>

          {/* Button 2: Generate Report */}
          <button
            onClick={handleGenerateReportClick}
            title="Generate & download PDF due diligence report"
            className="w-full py-2 px-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 font-bold text-[11px] border border-purple-200 dark:border-purple-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <FileDown size={12} />
            <span>Report</span>
          </button>

          {/* Button 3: Compare */}
          <button
            onClick={handleCompare}
            title="Benchmark property specs and valuation"
            className="w-full py-2 px-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-600 hover:text-white text-cyan-700 dark:text-cyan-300 font-bold text-[11px] border border-cyan-200 dark:border-cyan-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <ArrowLeftRight size={12} />
            <span>Compare</span>
          </button>

          {/* Button 4: Remove */}
          <button
            onClick={handleRemoveClick}
            title="Remove from saved watchlist"
            className="w-full py-2 px-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-700 dark:text-rose-300 font-bold text-[11px] border border-rose-200 dark:border-rose-800 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Remove</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default SavedPropertyCard;
