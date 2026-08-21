import React from "react";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck, ShieldAlert, AlertTriangle, ArrowUpRight, Building2, ImageOff, FileText } from "lucide-react";
import Badge from "../common/Badge";

import { setLiveActiveProperty } from "../../services/liveStore";

function LinearPropertyCard({ property, onInspect }) {
  const item = property || {};
  const imgSrc = item.imageUrl || item.image || null;

  const handleCardClick = () => {
    const pid = item.numericId || item.propertyId || item.id;
    if (pid) setLiveActiveProperty(pid);
    if (onInspect) onInspect(item);
  };

  const getRiskBadge = () => {
    const variant = item.variant || (item.riskScore > 60 ? "danger" : item.riskScore > 30 ? "warning" : "success");
    if (variant === "success" || item.riskLevel === "Low Risk") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck size={12} /> Low Risk
        </span>
      );
    }
    if (variant === "warning" || item.riskLevel === "Moderate Risk") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <ShieldAlert size={12} /> Moderate Risk
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
        <AlertTriangle size={12} /> High Risk
      </span>
    );
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={handleCardClick}
      transition={{ duration: 0.2 }}
      className="white-card rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs hover:shadow-xl dark:hover:shadow-blue-500/10 cursor-pointer overflow-hidden flex flex-col justify-between group transition-all"
    >
      {/* Property Image Banner or Clean "No Image Available" Placeholder */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-[#0F172A] flex items-center justify-center">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500 space-y-1.5 bg-slate-100 dark:bg-[#0F172A] w-full h-full">
            <ImageOff size={28} />
            <span className="text-xs font-mono font-bold">No Image Available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="text-[11px] font-mono font-bold bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-0.5 rounded-md border border-white/20">
            {item.id || item.propertyId ? `PR-${item.propertyId || item.id}` : "Not Available"}
          </span>
          <Badge variant={item.variant || "success"}>{item.status || "Verified"}</Badge>
        </div>

        {/* Bottom Image Overlay */}
        <div className="absolute bottom-3 left-3 right-3 z-10 space-y-0.5">
          <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded border border-cyan-500/30">
            {item.type || item.propertyType || "Property Parcel"}
          </span>
          <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
            {item.propertyName || item.title || item.address || "Property Parcel"}
          </h3>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-1.5 line-clamp-1">
            <MapPin size={14} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
            <span>{item.address || "Address Not Available"}</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] pl-5 font-medium">
            {item.city || "Not Available"}, {item.state || "Not Available"}
          </p>
        </div>

        {/* Footer Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between">
          <div>{getRiskBadge()}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `/due-diligence-report?id=${item.propertyId || item.id || "PR-1001"}`;
              }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#334155] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#334155] transition-colors cursor-pointer"
              title="View Due Diligence Report"
            >
              <FileText size={12} className="text-blue-600 dark:text-cyan-400" />
              <span>Report</span>
            </button>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-blue-600 dark:text-cyan-400 group-hover:underline">
              Inspect <ArrowUpRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default LinearPropertyCard;
