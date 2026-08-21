import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, User, Ruler, ArrowRight, ImageOff } from "lucide-react";
import Badge from "../common/Badge";

function PropertyCard({ property }) {
  const navigate = useNavigate();
  const item = property || {};

  const handleOpenDetails = (e) => {
    e.stopPropagation();
    if (item.id || item.propertyId) {
      navigate(`/property-details?id=${item.propertyId || item.id}`, { state: { property: item } });
    }
  };

  const imgSrc = item.imageUrl || item.image || null;

  return (
    <div
      onClick={handleOpenDetails}
      className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200/80 dark:border-[#334155] shadow-sm hover:shadow-xl dark:hover:shadow-blue-500/10 group cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Property Image Banner or No Image Available Placeholder */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-[#0F172A] flex items-center justify-center">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={item.propertyName || item.address || "Property"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500 space-y-1.5 bg-slate-100 dark:bg-[#0F172A] w-full h-full">
            <ImageOff size={28} />
            <span className="text-xs font-mono font-bold">No Image Available</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span className="text-[11px] font-mono font-bold bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-0.5 rounded-lg border border-white/20">
            {item.id || item.propertyId ? `PR-${item.propertyId || item.id}` : "Not Available"}
          </span>
          <Badge variant={item.variant || "success"}>{item.status || "Verified"}</Badge>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-10 space-y-1">
          <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-bold bg-slate-900/80 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-cyan-500/30">
            {item.type || item.propertyType || "Residential"}
          </span>
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 leading-snug">
            {item.propertyName || item.title || item.address || "Property Parcel"}
          </h3>
        </div>
      </div>

      {/* Property Info Body */}
      <div className="p-5 space-y-4 bg-white dark:bg-[#1E293B] flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-1.5 line-clamp-1">
              <MapPin size={15} className="text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
              <span>{item.address || "Address Not Available"}</span>
            </p>
            <p className="text-[11px] text-slate-500 dark:text-[#CBD5E1] pl-5 font-medium">
              {item.city || "Not Available"}, {item.state || "Not Available"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#334155] flex items-center gap-2">
              <User size={14} className="text-blue-600 dark:text-cyan-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] uppercase font-mono">Owner</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.owner || "Not Available"}</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#334155] flex items-center gap-2">
              <Ruler size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 dark:text-[#94A3B8] uppercase font-mono">Plot Area</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.area || "Not Available"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-mono text-slate-400 dark:text-[#94A3B8]">
              Score: <span className="font-bold text-blue-600 dark:text-cyan-400">{item.score || "Not Available"}</span>
            </p>
          </div>

          <button
            onClick={handleOpenDetails}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer transform active:scale-95 shrink-0"
          >
            <span>View Details</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PropertyCard;