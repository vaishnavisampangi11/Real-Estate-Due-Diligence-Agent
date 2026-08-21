import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Badge from "../common/Badge";
import EmptyState from "../common/EmptyState";
import { getAllProperties } from "../../services/propertyService";

function RecentSearches() {
  const navigate = useNavigate();
  const [searches, setSearches] = useState([]);

  useEffect(() => {
    getAllProperties(0, 5)
      .then((res) => {
        if (res && res.data) {
          const items = res.data.content || res.data;
          if (Array.isArray(items)) {
            setSearches(items);
          }
        }
      })
      .catch(() => setSearches([]));
  }, []);

  const handleOpenDetails = (item, e) => {
    if (e) e.stopPropagation();
    const pid = item.propertyId || item.id;
    if (pid) {
      navigate(`/property-details?id=${pid}`, { state: { property: item } });
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
          <span>🕒</span> Recent Property Audits
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] mt-1">
          Latest property due diligence checks performed in land registries.
        </p>
      </div>

      {searches.length > 0 ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#334155]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 text-xs uppercase font-mono tracking-wider">
                <th className="p-4 font-semibold">Property Address</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#334155] bg-white dark:bg-[#0F172A]">
              {searches.map((item, idx) => (
                <tr
                  key={item.propertyId || idx}
                  onClick={(e) => handleOpenDetails(item, e)}
                  className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/80 transition-colors cursor-pointer group"
                >
                  <td className="p-4 font-bold text-slate-900 dark:text-[#F8FAFC]">
                    {item.propertyName || item.address?.addressLine1 || "Property Parcel"}
                  </td>
                  <td className="p-4 text-xs font-semibold">{item.propertyType || "Not Available"}</td>
                  <td className="p-4"><Badge variant="success">{item.status || "Verified"}</Badge></td>
                  <td className="p-4 text-right">
                    <button
                      onClick={(e) => handleOpenDetails(item, e)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-400 hover:text-blue-700 cursor-pointer"
                    >
                      <span>View</span>
                      <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No recent property audits."
          message="No search query records were returned by the backend system."
        />
      )}
    </div>
  );
}

export default RecentSearches;