import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  TrendingUp,
  ArrowRight,
  MousePointerClick,
  ImageOff,
} from "lucide-react";
import Badge from "../common/Badge";

function PropertyPreviewPanel({ selectedProperty }) {
  const navigate = useNavigate();

  if (!selectedProperty) {
    return (
      <div className="white-card rounded-2xl p-8 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs text-center space-y-4 min-h-[460px] flex flex-col items-center justify-center">
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
          <MousePointerClick size={32} />
        </div>
        <div className="space-y-1.5 max-w-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
            Select a property from search results to preview details.
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
            Click any property record on the left to inspect risk metrics and due diligence summary.
          </p>
        </div>
      </div>
    );
  }

  const p = selectedProperty;
  const imgSrc = p.imageUrl || p.image || null;

  const handleOpenWorkspace = () => {
    const pid = p.propertyId || p.id;
    navigate(`/property-details?id=${pid}`, { state: { property: p } });
  };

  const handleGenerateReport = () => {
    navigate("/due-diligence-report", { state: { property: p } });
  };

  const handleCompare = () => {
    navigate("/comparable-properties", { state: { property: p } });
  };

  const getRiskBadge = () => {
    const variant = p.variant || (p.riskScore > 60 ? "danger" : p.riskScore > 30 ? "warning" : "success");
    if (variant === "success" || p.riskLevel === "Low Risk") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck size={14} /> Low Risk ({p.riskScore || "N/A"}/100)
        </span>
      );
    }
    if (variant === "warning" || p.riskLevel === "Moderate Risk") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <ShieldAlert size={14} /> Moderate Risk ({p.riskScore || "N/A"}/100)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <AlertTriangle size={14} /> High Risk ({p.riskScore || "N/A"}/100)
      </span>
    );
  };

  return (
    <motion.div
      key={p.id || p.propertyId}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="white-card rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs overflow-hidden space-y-4 max-h-[calc(100vh-110px)] overflow-y-auto scrollbar-thin"
    >
      {/* Property Photo Banner or No Image Available Placeholder */}
      <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-slate-100 dark:bg-[#0F172A] shrink-0 border-b border-slate-200 dark:border-[#334155] flex items-center justify-center">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={p.title || p.address}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500 space-y-1.5 bg-slate-100 dark:bg-[#0F172A] w-full h-full">
            <ImageOff size={32} />
            <span className="text-xs font-mono font-bold">No Image Available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="text-xs font-mono font-bold bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg border border-white/20">
            APN: {p.id || p.propertyId ? `PR-${p.propertyId || p.id}` : "Not Available"}
          </span>
          <Badge variant={p.variant || "success"}>{p.status || "Verified"}</Badge>
        </div>

        <div className="absolute bottom-3 left-4 right-4 z-10 space-y-1">
          <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-cyan-500/30">
            {p.type || p.propertyType || "Property Parcel"}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white line-clamp-1">
            {p.propertyName || p.title || p.address || "Property Parcel"}
          </h2>
        </div>
      </div>

      {/* Live Preview Info Body */}
      <div className="p-5 pt-0 space-y-4">
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <MapPin size={15} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <span>{p.address || "Address Not Available"}, {p.city || "Not Available"}, {p.state || "Not Available"}</span>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <div>{getRiskBadge()}</div>
          </div>
        </div>

        {/* Concise Property Summary */}
        <div className="space-y-1 p-3.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/60 dark:border-[#334155]">
          <h4 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Property Summary
          </h4>
          <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
            {p.description || "Not Available"}
          </p>
        </div>

        {/* Quick Actions Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#334155] space-y-2.5">
          <button
            onClick={handleOpenWorkspace}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer transform active:scale-95"
          >
            <span>Open Property Workspace</span>
            <ArrowRight size={15} />
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleGenerateReport}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-[#334155] transition-colors cursor-pointer"
            >
              <FileText size={14} className="text-blue-600 dark:text-cyan-400" />
              <span>Generate Report</span>
            </button>

            <button
              onClick={handleCompare}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-[#334155] transition-colors cursor-pointer"
            >
              <TrendingUp size={14} className="text-cyan-600 dark:text-cyan-400" />
              <span>Compare Property</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PropertyPreviewPanel;
