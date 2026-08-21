import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Building2,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import {
  INDIAN_STATES_AND_UTS,
  getCitiesForState,
  BACKEND_PROPERTY_TYPES,
  BACKEND_PROPERTY_STATUSES,
} from "../../data/indiaLocations";

function PropertySearchWorkspaceHeader({
  searchAddress,
  setSearchAddress,
  stateFilter,
  setStateFilter,
  cityFilter,
  setCityFilter,
  priceFilter,
  setPriceFilter,
  riskFilter,
  setRiskFilter,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  allProperties = [],
  onClearFilters,
  onSearchSubmit,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Available States derived from real property database records
  const availableStates = useMemo(() => {
    const statesSet = new Set();
    allProperties.forEach((p) => {
      const st = (typeof p.state === "string" && p.state.trim()) || p.address?.state || "";
      if (st) statesSet.add(st);
    });

    if (statesSet.size > 0) {
      return Array.from(statesSet).sort();
    }
    return INDIAN_STATES_AND_UTS;
  }, [allProperties]);

  // Available cities derived directly from real property database records
  const availableCities = useMemo(() => {
    const citiesSet = new Set();

    allProperties.forEach((p) => {
      const pState = (typeof p.state === "string" && p.state.trim()) || p.address?.state || "";
      const pCity = (typeof p.city === "string" && p.city.trim()) || p.address?.city || "";

      if (pCity) {
        if (stateFilter === "ALL" || (pState && pState.toUpperCase() === stateFilter.toUpperCase())) {
          citiesSet.add(pCity);
        }
      }
    });

    if (citiesSet.size > 0) {
      return Array.from(citiesSet).sort();
    }

    return stateFilter !== "ALL" ? getCitiesForState(stateFilter) : [];
  }, [allProperties, stateFilter]);

  // Handle State Change: clear incompatible city selection
  const handleStateChange = (newState) => {
    setStateFilter(newState);
    setCityFilter("ALL");
  };

  const priceRanges = [
    { id: "ALL", label: "All Prices" },
    { id: "UNDER_10CR", label: "Under ₹10 Cr" },
    { id: "10CR_25CR", label: "₹10 Cr - ₹25 Cr" },
    { id: "25CR_50CR", label: "₹25 Cr - ₹50 Cr" },
    { id: "ABOVE_50CR", label: "Above ₹50 Cr" },
  ];

  const sortOptions = [
    { id: "price-asc", label: "Price: Low to High" },
    { id: "price-desc", label: "Price: High to Low" },
    { id: "name-asc", label: "Name: A to Z" },
    { id: "newest", label: "Newest Listed First" },
  ];

  // Auto-complete suggestion matches based on real properties
  const suggestions = useMemo(() => {
    if (!searchAddress || searchAddress.trim().length < 2) return [];
    const q = searchAddress.toLowerCase().trim();
    return allProperties
      .filter((p) => {
        const name = (p.propertyName || p.title || "").toLowerCase();
        const code = (p.propertyCode || p.id || "").toLowerCase();
        const city = (p.city || p.address?.city || "").toLowerCase();
        const state = (p.state || p.address?.state || "").toLowerCase();
        const type = (typeof p.propertyType === "object" ? p.propertyType?.typeName : p.propertyType || "").toLowerCase();
        return (
          name.includes(q) ||
          code.includes(q) ||
          city.includes(q) ||
          state.includes(q) ||
          type.includes(q)
        );
      })
      .slice(0, 5);
  }, [searchAddress, allProperties]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters =
    Boolean(searchAddress.trim()) ||
    stateFilter !== "ALL" ||
    cityFilter !== "ALL" ||
    priceFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    statusFilter !== "ALL";

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      if (onSearchSubmit) onSearchSubmit();
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6 font-mono">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-bold mb-2">
            <Search size={14} /> Shared Real Estate Inventory
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Property Search Workstation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-sans mt-1 max-w-2xl">
            Query property records by title, state, city, property type, or verification status directly from PostgreSQL.
          </p>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw size={14} />
            <span>Clear All Filters</span>
          </button>
        )}
      </div>

      {/* 1. LARGE SEARCH BAR & AUTO-COMPLETE SUGGESTIONS */}
      <div className="relative" ref={searchContainerRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-4 text-blue-600 dark:text-cyan-400" size={20} />
          <input
            type="text"
            value={searchAddress}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setSearchAddress(e.target.value);
              setShowSuggestions(true);
            }}
            placeholder="Search by property name, city, state, address, or property code..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-xs"
          />
          {searchAddress && (
            <button
              type="button"
              onClick={() => setSearchAddress("")}
              className="absolute right-4 p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Auto-complete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] rounded-2xl shadow-xl z-30 overflow-hidden divide-y divide-slate-100 dark:divide-[#334155]">
            <div className="px-4 py-2 bg-slate-50 dark:bg-[#0F172A] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              MATCHING DATABASE PROPERTIES
            </div>
            {suggestions.map((item) => {
              const name = item.propertyName || item.title;
              const pid = item.propertyCode || `PROP-${item.propertyId || item.numericId}`;
              const city = item.city || item.address?.city || "Hyderabad";
              return (
                <div
                  key={pid}
                  onClick={() => {
                    setSearchAddress(name);
                    setShowSuggestions(false);
                  }}
                  className="p-3.5 px-4 hover:bg-blue-50/70 dark:hover:bg-blue-950/40 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Building2 size={16} className="text-blue-600 dark:text-cyan-400 shrink-0" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{name}</h4>
                      <p className="text-[11px] text-slate-500">{city} • {pid}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-cyan-400">
                    Select
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. FILTER DROPDOWNS GRID */}
      <div className="pt-4 border-t border-slate-100 dark:border-[#334155] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase flex items-center gap-1.5">
            <SlidersHorizontal size={14} className="text-blue-600 dark:text-cyan-400" /> Filter Criteria
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          {/* State Filter (All 36 Indian States & UTs) */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold block">State / UT</label>
            <select
              value={stateFilter}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-slate-100 font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">All States & UTs</option>
              {availableStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter (Derived from Real Properties) */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold block">City</label>
            <select
              value={cityFilter}
              disabled={availableCities.length === 0}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-slate-100 font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">
                {stateFilter === "ALL" ? "All Cities" : "All Cities in " + stateFilter}
              </option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Property Type Filter */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold block">Property Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-slate-100 font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Property Types</option>
              {BACKEND_PROPERTY_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>

          {/* Verification Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold block">Verification Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-slate-100 font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              {BACKEND_PROPERTY_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-1">
            <label className="text-[10px] text-slate-400 uppercase font-bold block">Price Range</label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-slate-100 font-semibold px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              {priceRanges.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertySearchWorkspaceHeader;
