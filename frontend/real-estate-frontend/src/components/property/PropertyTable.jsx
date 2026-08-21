import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ImageOff } from "lucide-react";
import Badge from "../common/Badge";
import { setLiveActiveProperty } from "../../services/liveStore";

function PropertyTable({ properties = [] }) {
  const navigate = useNavigate();

  const handleOpenDetails = (item, e) => {
    if (e) e.stopPropagation();
    const pid = item.propertyId || item.numericId || item.id;
    if (pid) {
      setLiveActiveProperty(pid);
      navigate(`/properties/${pid}`, { state: { property: item } });
    }
  };

  if (properties.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-200 dark:border-[#334155]">
        <p className="text-sm font-semibold text-slate-500 dark:text-[#94A3B8]">
          No properties found.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#334155] shadow-xs bg-white dark:bg-[#1E293B]">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="sticky top-0 bg-slate-900 dark:bg-[#1E293B] text-white dark:text-[#CBD5E1] text-xs font-mono uppercase tracking-wider z-10 border-b border-slate-800 dark:border-[#334155]">
          <tr>
            <th className="p-3.5 font-semibold">Property & Address</th>
            <th className="p-3.5 font-semibold">Owner</th>
            <th className="p-3.5 font-semibold">Type & Zoning</th>
            <th className="p-3.5 font-semibold">Tax Status</th>
            <th className="p-3.5 font-semibold">Flood Risk</th>
            <th className="p-3.5 font-semibold">Score</th>
            <th className="p-3.5 font-semibold">Status</th>
            <th className="p-3.5 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-[#334155]">
          {properties.map((item, idx) => {
            const thumbSrc = item.imageUrl || item.image || null;

            return (
              <tr
                key={item.id || item.propertyId || idx}
                onClick={(e) => handleOpenDetails(item, e)}
                className="even:bg-slate-50/60 dark:even:bg-[#111827] odd:bg-white dark:odd:bg-[#0F172A] hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer group"
              >
                <td className="p-3.5">
                  <div className="flex items-center gap-3">
                    {thumbSrc ? (
                      <img
                        src={thumbSrc}
                        alt={item.title || item.address || "Property"}
                        className="w-12 h-10 rounded-lg object-cover border border-slate-200 dark:border-[#334155] shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-10 rounded-lg bg-slate-200 dark:bg-[#0F172A] flex items-center justify-center text-slate-400 shrink-0 border border-slate-300 dark:border-[#334155]">
                        <ImageOff size={16} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 dark:text-[#F8FAFC] text-sm group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                        {item.propertyName || item.title || "Property Parcel"}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-[#CBD5E1] truncate font-medium">
                        {typeof item.address === "string" ? item.address : `${item.propertyName || "Parcel"}, ${item.city || "Hyderabad"}`}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-3.5 font-medium text-slate-700 dark:text-slate-200">
                  {item.ownerName || item.owner || "Enterprise Portfolio"}
                </td>
                <td className="p-3.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="font-bold">{item.landType || item.type || "Commercial"}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{item.zoning || "C-4 Commercial"}</div>
                </td>
                <td className="p-3.5 font-medium text-slate-700 dark:text-slate-200">
                  {item.taxStatus || "Fully Paid"}
                </td>
                <td className="p-3.5 font-medium text-slate-700 dark:text-slate-200">
                  {item.floodRisk || "Low"}
                </td>
                <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                  {item.score || 100 - (item.riskScore || 10)} / 100
                </td>
                <td className="p-3.5">
                  <Badge variant={item.variant || (item.status?.includes("Verified") ? "success" : "info")}>
                    {item.status || "Verified"}
                  </Badge>
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={(e) => handleOpenDetails(item, e)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                    title="View Property Details"
                  >
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default PropertyTable;