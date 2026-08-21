import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2, MapPin } from "lucide-react";
import { setLiveActiveProperty } from "../../services/liveStore";
import { getAllProperties } from "../../services/propertyService";
import { showToast } from "../../utils/swal";

function PropertyContextSwitcher({ currentPropertyId, onPropertyChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [propertiesList, setPropertiesList] = useState([]);
  const [activeProperty, setActiveProperty] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getAllProperties()
      .then((res) => {
        if (!isMounted) return;
        if (res && res.data) {
          const items = res.data.content || (Array.isArray(res.data) ? res.data : []);
          setPropertiesList(items);

          const rawId = currentPropertyId || (items.length > 0 ? items[0].propertyId : null);
          const cleanId = typeof rawId === "number" ? rawId : parseInt((rawId || "1").toString().replace(/\D/g, "") || "1", 10);
          const found = items.find((p) => p.propertyId === cleanId);
          setActiveProperty(found || items[0] || null);
        }
      })
      .catch((err) => {
        console.warn("Property context switcher API error:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentPropertyId]);

  const handleSelectProperty = (e) => {
    const newId = e.target.value;
    setLiveActiveProperty(newId);
    
    if (onPropertyChange) {
      onPropertyChange(newId);
    }

    navigate(`${location.pathname}?id=${newId}`, { replace: true });
    showToast(`Switched active parcel to property #${newId}`, "info");
  };

  const activeNumId = (activeProperty?.propertyId || activeProperty?.numericId || currentPropertyId || "1")
    .toString()
    .replace(/\D/g, "") || "1";

  const propName = activeProperty?.propertyName || activeProperty?.title || `Property Parcel PR-${activeNumId}`;
  const addressText = typeof activeProperty?.address === "string"
    ? activeProperty.address
    : typeof activeProperty?.address === "object" && activeProperty.address !== null
    ? `${activeProperty.address.addressLine1 || ""}, ${activeProperty.address.city || "Hyderabad"}`
    : `${propName}, ${activeProperty?.city || "Hyderabad"}`;

  return (
    <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-[#334155] shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Active Property Info Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white font-bold shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400">
                ACTIVE CONTEXT • PR-{activeNumId}
              </span>
            </div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
              {propName}
            </h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <MapPin size={12} className="text-slate-400 shrink-0" />
              <span>{addressText}</span>
            </p>
          </div>
        </div>

        {/* Property Selector Dropdown */}
        {propertiesList.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500 shrink-0">Switch Parcel:</span>
            <select
              value={activeNumId}
              onChange={handleSelectProperty}
              className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 px-3 py-2 rounded-xl focus:outline-none cursor-pointer w-full md:w-64 truncate"
            >
              {propertiesList.map((p, idx) => {
                const numId = (p.propertyId || p.numericId || p.id || idx + 1).toString().replace(/\D/g, "") || `${idx + 1}`;
                const titleStr = p.propertyName || p.title || `Parcel #${numId}`;
                return (
                  <option key={numId} value={numId}>
                    PR-{numId} • {titleStr} ({p.city || "Hyderabad"})
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

export default PropertyContextSwitcher;
