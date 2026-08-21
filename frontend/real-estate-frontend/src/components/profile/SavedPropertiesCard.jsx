import React, { useState, useEffect } from "react";
import { Bookmark, MapPin, Eye, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Badge from "../common/Badge";
import Button from "../common/Button";
import { getLiveSavedProperties } from "../../services/liveStore";

function SavedPropertiesCard() {
  const navigate = useNavigate();
  const [savedProperties, setSavedProperties] = useState([]);

  useEffect(() => {
    const list = getLiveSavedProperties() || [];
    setSavedProperties(list);
  }, []);

  return (
    <div className="white-card rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs space-y-6 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
        <div className="flex items-center gap-2">
          <Bookmark className="text-blue-600 dark:text-cyan-400" size={18} />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">
            Watchlisted & Saved Properties ({savedProperties.length})
          </h3>
        </div>

        <button
          onClick={() => navigate("/property-search")}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
        >
          <span>Find Properties</span>
          <ExternalLink size={12} />
        </button>
      </div>

      {savedProperties.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3">
          <Bookmark size={24} className="mx-auto text-slate-400" />
          <p className="text-xs text-slate-500 font-bold">No saved properties in your watchlist yet.</p>
          <Button
            onClick={() => navigate("/property-search")}
            variant="outline"
            size="xs"
          >
            Explore Properties
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedProperties.map((p) => {
            const pId = p.numericId || p.propertyId || p.id;
            const pCode = p.propertyCode || p.id || `PROP-${pId}`;
            return (
              <div
                key={pId}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">
                      {pCode}
                    </span>
                    <Badge variant="success">{p.status || "Verified"}</Badge>
                  </div>

                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">
                    {p.propertyName || p.title}
                  </h4>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin size={12} /> {p.city || ""}, {p.state || ""}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-[#334155] flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                    {typeof p.marketValue === "number"
                      ? `₹${(p.marketValue / 10000000).toFixed(2)} Cr`
                      : p.marketValue || "Price on Request"}
                  </span>
                  <button
                    onClick={() => navigate("/property-details", { state: { propertyId: pId } })}
                    className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-300 hover:bg-blue-100 transition-colors cursor-pointer"
                    title="Inspect Property"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SavedPropertiesCard;
