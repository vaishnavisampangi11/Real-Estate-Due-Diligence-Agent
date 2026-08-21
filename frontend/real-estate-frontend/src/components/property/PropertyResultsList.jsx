import React from "react";
import { motion } from "framer-motion";
import { MapPin, ShieldCheck, ShieldAlert, AlertTriangle, ImageOff } from "lucide-react";

function PropertyResultsList({ properties = [], selectedProperty, onSelectProperty }) {
  if (properties.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 font-medium">
        No properties found.
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[calc(100vh-210px)] overflow-y-auto pr-1 scrollbar-thin">
      {properties.map((p) => {
        const isSelected = selectedProperty && (selectedProperty.id === p.id || selectedProperty.propertyId === p.propertyId);
        const imgSrc = p.imageUrl || p.image || null;

        const getRiskBadge = () => {
          const variant = p.variant || (p.riskScore > 60 ? "danger" : p.riskScore > 30 ? "warning" : "success");
          if (variant === "success" || p.riskLevel === "Low Risk") {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck size={11} /> Low Risk
              </span>
            );
          }
          if (variant === "warning" || p.riskLevel === "Moderate Risk") {
            return (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <ShieldAlert size={11} /> Moderate Risk
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              <AlertTriangle size={11} /> High Risk
            </span>
          );
        };

        return (
          <motion.div
            key={p.id || p.propertyId}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            onClick={() => onSelectProperty(p)}
            className={`white-card rounded-xl p-3 bg-white dark:bg-[#1E293B] border transition-all cursor-pointer flex items-center gap-3 overflow-hidden ${
              isSelected
                ? "border-blue-600 dark:border-cyan-400 ring-2 ring-blue-500/20 shadow-md"
                : "border-slate-200/80 dark:border-[#334155] hover:border-blue-400 dark:hover:border-cyan-500/50 shadow-xs"
            }`}
          >
            {/* Image Thumbnail or No Image Available Placeholder */}
            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-[#0F172A] shrink-0 border border-slate-200 dark:border-[#334155] flex items-center justify-center">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt={p.title || p.address}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-1 text-center text-slate-400 dark:text-slate-500 space-y-0.5">
                  <ImageOff size={18} />
                  <span className="text-[9px] font-mono font-bold leading-none">No Image</span>
                </div>
              )}
            </div>

            {/* Compact Info Details */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-[#94A3B8] uppercase truncate">
                  {p.type || p.propertyType || "Property"}
                </span>
                <div>{getRiskBadge()}</div>
              </div>

              <h4 className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] line-clamp-1">
                {p.propertyName || p.title || p.address || "Property Parcel"}
              </h4>

              <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] flex items-center gap-1 line-clamp-1">
                <MapPin size={12} className="text-blue-600 dark:text-cyan-400 shrink-0" />
                <span>{p.address || "Address Not Available"}</span>
              </p>

              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-mono">
                {p.city || "Not Available"}, {p.state || "Not Available"}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default PropertyResultsList;
