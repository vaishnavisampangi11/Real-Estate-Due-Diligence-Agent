import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  History,
  Sparkles,
} from "lucide-react";
import { showToast } from "../../utils/swal";

function PropertySearchPanel() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    address: "",
    city: "",
    state: "Telangana",
    pinCode: "",
    filterType: "all",
  });

  const recentSearches = [
    "Gachibowli Tech Park Phase 2, Hyderabad",
    "Whitefield Outer Ring Road, Bengaluru",
    "BKC Corporate Tower, Mumbai",
  ];

  const popularSearches = [
    "Financial District Hyderabad Commercials",
    "Whitefield IT Corridor Parcels",
    "Bandra Kurla Complex High Rise Suites",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = [searchParams.address, searchParams.city, searchParams.state, searchParams.pinCode]
      .filter(Boolean)
      .join(", ");

    if (!query) {
      showToast("Please enter an address, city, or PIN code to search", "warning");
      return;
    }

    showToast(`Searching properties for "${query}"`, "info");
    navigate("/property-search", { state: { searchQuery: query, filter: searchParams.filterType } });
  };

  const handlePillClick = (queryText) => {
    showToast(`Searching "${queryText}"`, "info");
    navigate("/property-search", { state: { searchQuery: queryText } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-[#334155]">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <Search size={20} className="text-blue-600 dark:text-cyan-400" />
            Enterprise Real Estate Search Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Query municipal deeds, survey numbers, title ownership chains, and zoning constraints.
          </p>
        </div>

        {/* Quick Filter Pill Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all", label: "All Properties" },
            { id: "commercial", label: "Commercial" },
            { id: "residential", label: "Residential" },
            { id: "industrial", label: "Industrial" },
            { id: "high-risk", label: "High Risk" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSearchParams((prev) => ({ ...prev, filterType: type.id }))}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${searchParams.filterType === type.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#334155]"
                }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Search Form */}
      <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
        {/* Address */}
        <div className="lg:col-span-4">
          <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-[#94A3B8] mb-1">
            Street Address / Survey Number / Parcel ID
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={16} />
            <input
              type="text"
              name="address"
              value={searchParams.address}
              onChange={handleChange}
              placeholder="e.g. Sy. No. 112/A, Financial District"
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* City */}
        <div className="lg:col-span-3">
          <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-[#94A3B8] mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={searchParams.city}
            onChange={handleChange}
            placeholder="e.g. Hyderabad"
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* State */}
        <div className="lg:col-span-2">
          <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-[#94A3B8] mb-1">
            State
          </label>
          <select
            name="state"
            value={searchParams.state}
            onChange={handleChange}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Telangana">Telangana</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Delhi">Delhi</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Kerala">Kerala</option>
          </select>
        </div>

        {/* PIN Code */}
        <div className="lg:col-span-2">
          <label className="block text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-[#94A3B8] mb-1">
            PIN Code
          </label>
          <input
            type="text"
            name="pinCode"
            value={searchParams.pinCode}
            onChange={handleChange}
            placeholder="500032"
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Submit Search Button */}
        <div className="lg:col-span-1 flex items-end">
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Search size={16} />
          </button>
        </div>
      </form>

      {/* Pills: Recent Searches & Popular Searches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-[#334155]">
        {/* Recent Searches */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <History size={12} /> Recent Searches:
          </span>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item, i) => (
              <button
                key={i}
                onClick={() => handlePillClick(item)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#334155] text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-[#334155] transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Searches */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Sparkles size={12} className="text-amber-500" /> Popular Searches:
          </span>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((item, i) => (
              <button
                key={i}
                onClick={() => handlePillClick(item)}
                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[11px] font-semibold text-blue-700 dark:text-cyan-300 border border-blue-200/60 dark:border-blue-800/40 transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PropertySearchPanel;
