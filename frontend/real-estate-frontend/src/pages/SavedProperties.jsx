import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Search,
  Filter,
  Trash2,
  Eye,
  FileDown,
  ShieldCheck,
  MapPin,
  Home,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";
import EmptyState from "../components/common/EmptyState";
import { getLiveSavedProperties, toggleSaveProperty } from "../services/liveStore";
import { showToast, showConfirmDialog } from "../utils/swal";

function SavedProperties() {
  const navigate = useNavigate();
  const [savedList, setSavedList] = useState(getLiveSavedProperties);
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const syncLiveData = () => {
      setSavedList(getLiveSavedProperties());
    };

    window.addEventListener("live_data_updated", syncLiveData);
    window.addEventListener("storage", syncLiveData);
    return () => {
      window.removeEventListener("live_data_updated", syncLiveData);
      window.removeEventListener("storage", syncLiveData);
    };
  }, []);

  const handleRemoveSaved = async (item, e) => {
    if (e) e.stopPropagation();
    const confirmed = await showConfirmDialog({
      title: "Remove Saved Property?",
      text: "Are you sure you want to remove this property from your saved watchlist?",
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Keep Saved",
      icon: "warning",
    });

    if (confirmed) {
      toggleSaveProperty(item);
      showToast("Property removed from saved watchlist", "info");
    }
  };

  const filtered = savedList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.propertyName.toLowerCase().includes(q) ||
      (item.address && typeof item.address === "string" && item.address.toLowerCase().includes(q)) ||
      item.city.toLowerCase().includes(q);
    const matchesCity = cityFilter === "ALL" || item.city === cityFilter;
    return matchesSearch && matchesCity;
  });

  const cities = Array.from(new Set(savedList.map((i) => i.city)));

  return (
    <MainLayout>
      <div className="space-y-8 pb-16">
        {/* Top Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <Home size={14} className="text-blue-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Saved Property Watchlist
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-mono font-bold text-[11px] border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            BUYER PORTFOLIO • {savedList.length} LIVE SAVED
          </span>
        </div>

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold mb-3">
              <Building2 size={14} /> Personal Diligence Portfolio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              ⭐ Saved Properties & Watchlist
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              Track land parcels, commercial hubs, and residential plots saved for due diligence evaluation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={() => navigate("/property-search")} variant="primary" size="sm" icon={Search}>
              Search More Properties
            </Button>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-[#334155] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 shrink-0">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search saved properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-80 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 px-3.5 py-2 rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-1.5 font-mono text-slate-500">
              <Filter size={14} />
              <span>City:</span>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                <option value="ALL">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center rounded-xl border border-slate-200 dark:border-[#334155] bg-slate-100 dark:bg-[#0F172A] p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === "grid" ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-cyan-400 shadow-xs" : "text-slate-500"}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === "table" ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-cyan-400 shadow-xs" : "text-slate-500"}`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT VIEW */}
        {filtered.length === 0 ? (
          <EmptyState
            title="No saved properties found"
            message="No properties matched your current filter criteria."
          />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.numericId || item.id}
                className="white-card rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs overflow-hidden flex flex-col justify-between group hover:border-blue-400 transition-all duration-200"
              >
                <div className="relative h-48 bg-slate-900 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.propertyName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-mono font-bold border border-white/20">
                    {item.city}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[10px] font-mono font-bold shadow-xs">
                    {100 - item.riskScore} AI SCORE
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400">
                      APN: PR-{item.numericId}
                    </span>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {item.propertyName}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                      <MapPin size={13} className="text-slate-400" />
                      <span className="truncate">{typeof item.address === "string" ? item.address : `${item.propertyName}, ${item.city}`}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-100 dark:border-[#334155] flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Valuation</span>
                      <strong className="text-slate-900 dark:text-white font-bold">{item.price}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Title Status</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">Verified Clear</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <Button
                      onClick={() => navigate(`/property-details?id=${item.numericId}`)}
                      variant="primary"
                      size="sm"
                      icon={Eye}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    <button
                      onClick={(e) => handleRemoveSaved(item, e)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                      title="Remove from Saved"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#334155]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-mono uppercase">
                    <th className="p-3.5">Property Name</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Valuation</th>
                    <th className="p-3.5">Risk Score</th>
                    <th className="p-3.5">Owner</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-[#334155] text-slate-700 dark:text-slate-200">
                  {filtered.map((item) => (
                    <tr key={item.numericId} className="hover:bg-slate-50 dark:hover:bg-[#0F172A]">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{item.propertyName}</td>
                      <td className="p-3.5 font-medium">{item.city}</td>
                      <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-cyan-400">{item.price}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{100 - item.riskScore} / 100</td>
                      <td className="p-3.5 font-medium">{item.owner}</td>
                      <td className="p-3.5 text-right space-x-2">
                        <Button onClick={() => navigate(`/property-details?id=${item.numericId}`)} variant="outline" size="sm">
                          Inspect
                        </Button>
                        <Button onClick={(e) => handleRemoveSaved(item, e)} variant="danger" size="sm">
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default SavedProperties;
