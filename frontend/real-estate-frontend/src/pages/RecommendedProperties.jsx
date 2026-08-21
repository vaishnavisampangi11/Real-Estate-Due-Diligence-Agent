import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import {
  Sparkles,
  Search,
  Filter,
  DollarSign,
  MapPin,
  Building2,
  ShieldCheck,
  Star,
  ArrowUpRight,
  Sliders,
  History,
  CheckCircle2,
  Zap,
  RotateCcw,
  LayoutGrid,
  List,
  ArrowUpDown,
  FileDown,
  Info,
  X,
  Scale,
  Award,
} from "lucide-react";
import { showToast } from "../utils/swal";
import { exportToPdf } from "../utils/exportUtils";
import { getLiveProperties, setLiveActiveProperty, toggleSaveProperty, isPropertySaved } from "../services/liveStore";
import PropertyContextSwitcher from "../components/common/PropertyContextSwitcher";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";

// Recent Search History Pills
const PREVIOUS_SEARCHES = [
  "Financial District Commercial Plots",
  "Low Risk Title Deeds (< 20)",
  "Hyderabad IT Corridor Parcels",
  "Bengaluru Tech Park Office Space",
  "Clear Title Sub-Registrar Deeds",
];

function RecommendedProperties() {
  const navigate = useNavigate();

  // User Preference Inputs for Recommendation Algorithm
  const [maxBudget, setMaxBudget] = useState(35); // Max Budget in Cr
  const [selectedLocation, setSelectedLocation] = useState("ALL");
  const [selectedPropertyType, setSelectedPropertyType] = useState("ALL");
  const [riskPreference, setRiskPreference] = useState("LOW");
  const [activeSearchChip, setActiveSearchChip] = useState("Financial District Commercial Plots");

  // View & Sorting state
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState("MATCH_DESC"); // 'MATCH_DESC', 'PRICE_ASC', 'PRICE_DESC', 'RISK_ASC'
  const [selectedPropForDetail, setSelectedPropForDetail] = useState(null); // Match Breakdown Modal

  // Master property list
  const masterProperties = useMemo(() => getLiveProperties() || [], []);

  // Mock Recommendation Algorithm Engine
  const recommendedList = useMemo(() => {
    let list = masterProperties.map((p, idx) => {
      let matchScore = 75; // Base Match
      let budgetFit = 20;
      let locationFit = 20;
      let typeFit = 20;
      let riskFit = 15;

      // Location Weight
      if (selectedLocation === "ALL" || p.city.toLowerCase() === selectedLocation.toLowerCase()) {
        matchScore += 10;
        locationFit = 25;
      }

      // Property Type Weight
      if (selectedPropertyType === "ALL" || (p.type || p.landType || "Commercial").toLowerCase().includes(selectedPropertyType.toLowerCase())) {
        matchScore += 10;
        typeFit = 25;
      }

      // Budget Weight
      const priceNumInCr = (p.marketValue || 250000000) / 10000000;
      if (priceNumInCr <= maxBudget) {
        matchScore += 10;
        budgetFit = 25;
      }

      // Risk Preference Weight
      const rScore = p.riskScore ?? 14;
      if (riskPreference === "LOW" && rScore <= 25) {
        matchScore += 5;
        riskFit = 24;
      } else if (riskPreference === "MODERATE" && rScore <= 50) {
        matchScore += 5;
        riskFit = 20;
      }

      // Clamp match score between 82% and 99%
      const finalMatch = Math.min(99, Math.max(82, matchScore));
      const numId = (p.numericId || p.propertyId || p.id || idx + 1001).toString().replace(/\D/g, "") || `${1001 + idx}`;

      return {
        numericId: numId,
        id: `PR-${numId}`,
        title: p.propertyName || p.title || `Commercial Parcel PR-${numId}`,
        city: p.city || "Hyderabad",
        address: typeof p.address === "string" ? p.address : `${p.propertyName || "Plot"}, ${p.city || "Hyderabad"}`,
        type: p.landType || p.type || "Commercial",
        price: typeof p.marketValue === "number" ? `₹ ${(p.marketValue / 10000000).toFixed(2)} Cr` : p.price || p.marketValue || "₹ 25.00 Cr",
        priceNum: priceNumInCr,
        area: typeof p.totalArea === "number" ? `${p.totalArea.toLocaleString()} sq ft` : p.totalArea || "45,000 sq ft",
        owner: p.ownerName || p.owner || "Ananya Rao",
        riskScore: rScore,
        status: p.status || "Verified Clear Title",
        matchPercentage: finalMatch,
        matchBreakdown: {
          budgetFit,
          locationFit,
          typeFit,
          riskFit,
        },
        imgSrc: p.imageUrl || p.image || p.imgSrc || FALLBACK_IMAGE,
        reason: `High match based on ${p.city} ${p.landType || "Commercial"} preference & low risk title chain.`,
      };
    });

    // Sorting
    if (sortBy === "MATCH_DESC") list.sort((a, b) => b.matchPercentage - a.matchPercentage);
    else if (sortBy === "PRICE_ASC") list.sort((a, b) => a.priceNum - b.priceNum);
    else if (sortBy === "PRICE_DESC") list.sort((a, b) => b.priceNum - a.priceNum);
    else if (sortBy === "RISK_ASC") list.sort((a, b) => a.riskScore - b.riskScore);

    return list;
  }, [masterProperties, maxBudget, selectedLocation, selectedPropertyType, riskPreference, sortBy]);

  const handleInspect = (numId) => {
    setLiveActiveProperty(numId);
    navigate(`/due-diligence-report?id=${numId}`);
  };

  const handleToggleSave = (propObj, e) => {
    e.stopPropagation();
    toggleSaveProperty(propObj);
    const isSaved = isPropertySaved(propObj.numericId);
    showToast(isSaved ? `Saved "${propObj.title}" to favorites` : `Removed "${propObj.title}" from saved`, isSaved ? "success" : "info");
  };

  const handleResetPreferences = () => {
    setMaxBudget(35);
    setSelectedLocation("ALL");
    setSelectedPropertyType("ALL");
    setRiskPreference("LOW");
    setSortBy("MATCH_DESC");
    showToast("Reset recommendation algorithm preferences to default", "info");
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* PROPERTY CONTEXT SWITCHER BAR */}
        <PropertyContextSwitcher currentPropertyId="1001" />

        {/* Page Header Action Banner */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold mb-2">
              <Sparkles size={14} /> Personalized AI Recommendation Engine v4.2
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              🤖 Recommended Properties for Acquisition
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              AI-driven property recommendations tailored to your budget limits, target locations, search history, land usage types, and title risk tolerance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button onClick={handleResetPreferences} variant="secondary" size="sm" icon={RotateCcw}>
              Reset Preferences
            </Button>
            <Button onClick={() => navigate("/comparable-properties")} variant="outline" size="sm" icon={ArrowUpDown}>
              Compare Matrix
            </Button>
          </div>
        </div>

        {/* PREVIOUS SEARCH HISTORY CHIPS */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-2">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <History size={13} className="text-blue-500" /> Based on Recent Search Activity:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
            {PREVIOUS_SEARCHES.map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setActiveSearchChip(chip);
                  showToast(`Applied recommendation filter: "${chip}"`, "info");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${activeSearchChip === chip
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#334155]"
                  }`}
              >
                🔍 {chip}
              </button>
            ))}
          </div>
        </div>

        {/* INTERACTIVE RECOMMENDATION ALGORITHM PREFERENCE CONTROLS */}
        <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#334155]">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <Sliders size={16} className="text-blue-600 dark:text-cyan-400" /> Tune Recommendation Algorithm Criteria
            </h3>

            {/* View Mode & Sorting Controls */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 px-3 py-1.5 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="MATCH_DESC">Sort: AI Match % (High to Low)</option>
                <option value="PRICE_ASC">Sort: Price (Low to High)</option>
                <option value="PRICE_DESC">Sort: Price (High to Low)</option>
                <option value="RISK_ASC">Sort: Lowest Risk Score</option>
              </select>

              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${viewMode === "grid" ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-cyan-400 shadow-xs" : "text-slate-400"
                    }`}
                  title="Grid View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${viewMode === "list" ? "bg-white dark:bg-[#1E293B] text-blue-600 dark:text-cyan-400 shadow-xs" : "text-slate-400"
                    }`}
                  title="List View"
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            {/* 1. Budget Slider */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 uppercase font-bold">Max Budget</span>
                <strong className="text-blue-600 dark:text-cyan-400 font-extrabold text-sm">
                  &le; ₹ {maxBudget} Cr
                </strong>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹10 Cr</span>
                <span>₹60 Cr+</span>
              </div>
            </div>

            {/* 2. Target Location */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
              <span className="text-slate-400 uppercase font-bold block">Target City / Location</span>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 p-2.5 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Cities (Hyderabad, Bengaluru, Mumbai)</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
              </select>
            </div>

            {/* 3. Property Type */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
              <span className="text-slate-400 uppercase font-bold block">Property Type</span>
              <select
                value={selectedPropertyType}
                onChange={(e) => setSelectedPropertyType(e.target.value)}
                className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 p-2.5 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Property Types</option>
                <option value="Commercial">Commercial IT Park</option>
                <option value="Residential">Residential Land</option>
                <option value="Industrial">Industrial Layout</option>
              </select>
            </div>

            {/* 4. Risk Preference */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
              <span className="text-slate-400 uppercase font-bold block">Title Risk Tolerance</span>
              <select
                value={riskPreference}
                onChange={(e) => setRiskPreference(e.target.value)}
                className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 p-2.5 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="LOW">Low Risk Only (Score &le; 25)</option>
                <option value="MODERATE">Moderate Risk (Score &le; 50)</option>
                <option value="ALL">All Risk Levels</option>
              </select>
            </div>
          </div>
        </div>

        {/* RECOMMENDED PROPERTIES GRID OR LIST */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedList.map((p) => {
              const saved = isPropertySaved(p.numericId);

              return (
                <motion.div
                  key={p.numericId}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handleInspect(p.numericId)}
                  className="white-card rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] p-5 shadow-xs hover:shadow-xl transition-all duration-200 space-y-4 cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Card Image Banner & AI Match Badge */}
                    <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={p.imgSrc}
                        alt={p.title}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* AI Match % Badge */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPropForDetail(p);
                        }}
                        className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md text-emerald-400 font-mono font-extrabold text-xs px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer"
                        title="Click to view AI Match Breakdown"
                      >
                        <Zap size={14} className="text-emerald-400 fill-emerald-400" /> {p.matchPercentage}% AI MATCH <Info size={12} className="text-slate-400" />
                      </button>

                      {/* Favorite / Save Button */}
                      <button
                        onClick={(e) => handleToggleSave(p, e)}
                        className={`absolute top-3 right-3 p-2.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${saved
                            ? "bg-rose-600 text-white border-rose-500 shadow-md"
                            : "bg-slate-900/80 text-white border-white/20 hover:bg-rose-600"
                          }`}
                      >
                        <Star size={16} fill={saved ? "currentColor" : "none"} />
                      </button>

                      <div className="absolute bottom-3 left-3 bg-slate-900/80 text-white px-2.5 py-0.5 rounded-md font-mono text-[10px]">
                        {p.type}
                      </div>
                    </div>

                    {/* Header Title & Location */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400">
                          {p.id}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <MapPin size={13} className="text-blue-500 shrink-0" />
                        <span className="truncate">{p.address}</span>
                      </p>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Market Valuation</span>
                        <strong className="text-blue-600 dark:text-cyan-400 font-extrabold text-sm">{p.price}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Plot Area</span>
                        <strong className="text-slate-800 dark:text-slate-200 font-bold">{p.area}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Owner Title</span>
                        <span className="text-slate-800 dark:text-slate-200 font-semibold truncate block">{p.owner}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Risk Score</span>
                        <div className="flex items-center gap-1">
                          <strong className={`font-bold ${p.riskScore > 60 ? "text-rose-600" : "text-emerald-600"}`}>
                            {p.riskScore} / 100
                          </strong>
                          <Badge variant={p.riskScore > 60 ? "danger" : "success"}>
                            {p.riskScore > 60 ? "High" : "Low"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation Reason Note */}
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/60 font-medium">
                      ✨ {p.reason}
                    </p>
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportToPdf(`Recommendation_Audit_${p.id}`, p.numericId);
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-700 dark:text-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
                      title="Download Quick PDF Summary"
                    >
                      <FileDown size={14} /> PDF
                    </button>

                    <button
                      onClick={() => handleInspect(p.numericId)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Inspect Workstation <ArrowUpRight size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-4">
            {recommendedList.map((p) => {
              const saved = isPropertySaved(p.numericId);

              return (
                <div
                  key={p.numericId}
                  onClick={() => handleInspect(p.numericId)}
                  className="white-card rounded-2xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={p.imgSrc}
                      alt={p.title}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-[#334155] shrink-0"
                    />

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-blue-600 dark:text-cyan-400">
                          {p.id}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono font-extrabold text-[10px]">
                          ⚡ {p.matchPercentage}% AI MATCH
                        </span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base truncate group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                        <MapPin size={12} className="text-blue-500 shrink-0" />
                        <span>{p.address}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-xs font-mono shrink-0">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Valuation</span>
                      <strong className="text-blue-600 dark:text-cyan-400 font-extrabold text-sm">{p.price}</strong>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block">Risk Index</span>
                      <Badge variant={p.riskScore > 60 ? "danger" : "success"}>
                        {p.riskScore} / 100 ({p.riskScore > 60 ? "High" : "Low"})
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleToggleSave(p, e)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${saved ? "bg-rose-600 text-white border-rose-500" : "bg-slate-100 dark:bg-[#0F172A] text-slate-400 border-slate-200 dark:border-[#334155]"
                          }`}
                      >
                        <Star size={16} fill={saved ? "currentColor" : "none"} />
                      </button>

                      <button
                        onClick={() => handleInspect(p.numericId)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        Inspect <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AI MATCH BREAKDOWN MODAL */}
        <AnimatePresence>
          {selectedPropForDetail && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedPropForDetail(null)}
                className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-lg w-full space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-600 text-white font-bold shrink-0">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        AI Match Weight Breakdown
                      </h2>
                      <p className="text-xs text-slate-500 font-mono">
                        {selectedPropForDetail.id} - {selectedPropForDetail.title}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPropForDetail(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
                    <span className="font-extrabold text-emerald-900 dark:text-emerald-300 text-sm">Overall Acquisition AI Match</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {selectedPropForDetail.matchPercentage}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Budget Compatibility</span>
                        <strong className="text-slate-800 dark:text-slate-200">{selectedPropForDetail.matchBreakdown.budgetFit} / 25 pts</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${(selectedPropForDetail.matchBreakdown.budgetFit / 25) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Location Corridor Weight</span>
                        <strong className="text-slate-800 dark:text-slate-200">{selectedPropForDetail.matchBreakdown.locationFit} / 25 pts</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(selectedPropForDetail.matchBreakdown.locationFit / 25) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Land Usage & Type Fit</span>
                        <strong className="text-slate-800 dark:text-slate-200">{selectedPropForDetail.matchBreakdown.typeFit} / 25 pts</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-purple-500" style={{ width: `${(selectedPropForDetail.matchBreakdown.typeFit / 25) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Title Deed Safety Index</span>
                        <strong className="text-slate-800 dark:text-slate-200">{selectedPropForDetail.matchBreakdown.riskFit} / 25 pts</strong>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(selectedPropForDetail.matchBreakdown.riskFit / 25) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex items-center justify-end">
                  <Button onClick={() => setSelectedPropForDetail(null)} variant="secondary" size="sm">
                    Close Breakdown
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

export default RecommendedProperties;
