import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  X,
  MapPin,
  User,
  Ruler,
  DollarSign,
  Building,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  TrendingUp,
  ArrowRight,
  Clock,
  Share2,
  ImageOff,
} from "lucide-react";
import Badge from "../common/Badge";
import { showToast } from "../../utils/swal";

function PropertyInspectionDrawer({ isOpen, onClose, property }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!property) return null;
  const p = property;
  const imgSrc = p.imageUrl || p.image || null;

  const handleOpenWorkspace = () => {
    onClose();
    const pid = p.propertyId || p.id;
    navigate(`/property-details?id=${pid}`, { state: { property: p } });
  };

  const handleGenerateReport = () => {
    onClose();
    navigate("/due-diligence-report", { state: { property: p } });
  };

  const handleCompare = () => {
    onClose();
    navigate("/comparable-properties", { state: { property: p } });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    showToast(`Inspection link copied!`, "success");
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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-white dark:bg-[#1E293B] shadow-2xl border-l border-slate-200 dark:border-[#334155] flex flex-col justify-between overflow-y-auto"
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-[#334155] flex items-center justify-between bg-slate-50/80 dark:bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase">
                  Property Inspection
                </span>
                <span className="text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                  {p.id || p.propertyId ? `PR-${p.propertyId || p.id}` : "Not Available"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors cursor-pointer"
                  title="Share Link"
                >
                  <Share2 size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#334155] transition-colors cursor-pointer"
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Photo Banner or No Image Available Placeholder */}
              <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-center">
                {imgSrc ? (
                  <img
                    src={imgSrc}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500 space-y-1.5 bg-slate-100 dark:bg-[#0F172A] w-full h-full">
                    <ImageOff size={32} />
                    <span className="text-xs font-mono font-bold">No Image Available</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span className="text-xs font-mono font-bold bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-lg border border-white/20">
                    APN: {p.id || p.propertyId || "Not Available"}
                  </span>
                  <Badge variant={p.variant || "success"}>{p.status || "Verified"}</Badge>
                </div>

                <div className="absolute bottom-3 left-4 right-4 z-10 space-y-1">
                  <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-cyan-500/30">
                    {p.type || p.propertyType || "Property Parcel"}
                  </span>
                  <h2 className="text-lg font-bold text-white line-clamp-1">
                    {p.propertyName || p.title || p.address || "Property Parcel"}
                  </h2>
                </div>
              </div>

              {/* Title & Address */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <MapPin size={16} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span>{p.address || "Address Not Available"}, {p.city || "Not Available"}, {p.state || "Not Available"}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>{getRiskBadge()}</div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#334155]">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Property Audit Summary
                </h4>
                <p className="text-xs text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
                  {p.description || "Not Available"}
                </p>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#334155] flex items-center gap-2.5">
                  <User size={16} className="text-blue-600 dark:text-cyan-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Owner</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.owner || "Not Available"}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#334155] flex items-center gap-2.5">
                  <Ruler size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Plot Area</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.area || "Not Available"}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#334155] flex items-center gap-2.5">
                  <Building size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Zoning</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.zoning || "Not Available"}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#334155] flex items-center gap-2.5">
                  <DollarSign size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-mono">Assessed Value</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{p.assessedVal || p.score || "Not Available"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="p-5 border-t border-slate-200 dark:border-[#334155] bg-slate-50/80 dark:bg-[#0F172A]/80 backdrop-blur-md sticky bottom-0 z-20 space-y-2.5">
              <button
                onClick={handleOpenWorkspace}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer transform active:scale-95"
              >
                <span>Open Full Property Workspace</span>
                <ArrowRight size={15} />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleGenerateReport}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#334155] text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-[#334155] transition-colors cursor-pointer shadow-xs"
                >
                  <FileText size={14} className="text-blue-600 dark:text-cyan-400" />
                  <span>Generate Report</span>
                </button>

                <button
                  onClick={handleCompare}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-[#334155] text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-[#334155] transition-colors cursor-pointer shadow-xs"
                >
                  <TrendingUp size={14} className="text-cyan-600 dark:text-cyan-400" />
                  <span>Compare Property</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default PropertyInspectionDrawer;
