import React from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Award,
  GraduationCap,
  Activity,
  Train,
  Shield,
  BarChart3,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Flame,
  CheckCircle2,
  Lock,
} from "lucide-react";
import Badge from "../common/Badge";

/**
 * Enterprise Market Insights Component
 * Displays market intelligence cards with visual charts and corridor analytics.
 */
function MarketInsights({ city = "Hyderabad", corridor = "Financial District Nanakramguda" }) {
  // SVG Price Trend Chart Points
  const trendPoints = [
    { month: "Jan", val: 12200 },
    { month: "Feb", val: 12800 },
    { month: "Mar", val: 13400 },
    { month: "Apr", val: 13900 },
    { month: "May", val: 14300 },
    { month: "Jun", val: 14850 },
  ];

  // SVG Demand Bar Chart Items
  const demandBars = [
    { qtr: "Q1", rate: 82 },
    { qtr: "Q2", rate: 86 },
    { qtr: "Q3", rate: 90 },
    { qtr: "Q4", rate: 96 },
  ];

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#334155]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold mb-2">
            <BarChart3 size={14} /> AI Real Estate Market Intelligence
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            🚀 Market Insights & Corridor Analytics
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1">
            Regional market valuation trends, connectivity infrastructure, and safety indices for <strong className="text-slate-900 dark:text-white">{corridor}, {city}</strong>.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shrink-0">
          <Sparkles size={14} /> LIVE MARKET DATA
        </span>
      </div>

      {/* 8 MARKET CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CARD 1: AVERAGE PRICE */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="white-card rounded-2xl p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-[#CBD5E1]">
              Average Price
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
              <DollarSign size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              ₹ 14,850 <span className="text-xs font-normal text-slate-400">/ sq.ft</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Average Commercial & Land Rate in Corridor
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-xs">
            <Badge variant="success">+8.5% vs 2025</Badge>
            <span className="text-[10px] font-mono text-slate-400">GHMC Registry Avg</span>
          </div>
        </motion.div>

        {/* CARD 2: PRICE TREND (WITH SVG SPARKLINE CHART) */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="white-card rounded-2xl p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-[#CBD5E1]">
              Price Trend
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                +12.4% <span className="text-xs font-normal text-slate-400">YoY</span>
              </h3>
              <Badge variant="success">Bullish</Badge>
            </div>

            {/* SVG Sparkline Price Chart */}
            <div className="h-10 pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 120 30">
                <path
                  d="M0,25 Q20,20 40,15 T80,10 T120,3"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle cx="120" cy="3" r="4" fill="#10B981" />
              </svg>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Jan: ₹12.2k</span>
            <span>Jun: ₹14.8k</span>
          </div>
        </motion.div>

        {/* CARD 3: INVESTMENT SCORE (WITH CIRCULAR SCORE GAUGE) */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="white-card rounded-2xl p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-[#CBD5E1]">
              Investment Score
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
              <Award size={18} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                88 <span className="text-xs font-normal text-slate-400">/ 100</span>
              </h3>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-0.5">
                Grade A ROI Potential
              </p>
            </div>

            {/* Mini SVG Circle Progress */}
            <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle cx="24" cy="24" r="18" stroke="#334155" strokeWidth="4" fill="transparent" />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  stroke="#A855F7"
                  strokeWidth="4"
                  strokeDasharray="113.1"
                  strokeDashoffset="13.5"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[10px] font-mono font-bold text-white">88%</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Capital Growth: High</span>
            <span>Yield: 7.8%</span>
          </div>
        </motion.div>

        {/* CARD 4: NEARBY SCHOOLS */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="white-card rounded-2xl p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-[#CBD5E1]">
              Nearby Schools
            </span>
            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              <GraduationCap size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              12 <span className="text-xs font-normal text-slate-400">Top-Rated</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] line-clamp-1">
              Oakridge (1.2 km), DPS (2.1 km), Chirec (2.8 km)
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Radius: &lt; 3.0 km</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">100% Accredited</span>
          </div>
        </motion.div>

        {/* CARD 5: HOSPITALS */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="white-card rounded-2xl p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-[#CBD5E1]">
              Hospitals
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              <Activity size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              8 <span className="text-xs font-normal text-slate-400">Multispecialty</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] line-clamp-1">
              KIMS (800m), Apollo Health City (1.8 km), Care (2.4 km)
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Radius: &lt; 2.5 km</span>
            <span className="text-rose-600 dark:text-rose-400 font-bold">24/7 Trauma Care</span>
          </div>
        </motion.div>

        {/* CARD 6: METRO CONNECTIVITY */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="white-card rounded-2xl p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-[#CBD5E1]">
              Metro Connectivity
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <Train size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              2 <span className="text-xs font-normal text-slate-400">Stations</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] line-clamp-1">
              Raidurg Metro (650m), HITECH Station (1.2 km)
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Walk Distance: 8 mins</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">Blue Line Corridor</span>
          </div>
        </motion.div>

        {/* CARD 7: CRIME INDEX */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="white-card rounded-2xl p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-[#CBD5E1]">
              Crime Index
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Shield size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                12 <span className="text-xs font-normal text-slate-400">/ 100</span>
              </h3>
              <Badge variant="success">Very Safe</Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              24/7 Gated Police Surveillance & Smart CCTV Grid
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Patrol Response: &lt; 4m</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Top 5% Safe City</span>
          </div>
        </motion.div>

        {/* CARD 8: DEMAND SCORE (WITH SVG BAR CHART) */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="white-card rounded-2xl p-5 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col justify-between space-y-3 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 dark:text-[#CBD5E1]">
              Demand Score
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800">
              <Flame size={18} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                92 <span className="text-xs font-normal text-slate-400">/ 100</span>
              </h3>
              <Badge variant="info">High Demand</Badge>
            </div>

            {/* SVG Bar Chart for Quarterly Absorption */}
            <div className="flex items-end justify-between gap-1.5 h-8 pt-1">
              {demandBars.map((bar) => (
                <div key={bar.qtr} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className="w-full bg-blue-600 dark:bg-cyan-400 rounded-t-sm transition-all duration-500"
                    style={{ height: `${(bar.rate / 100) * 24}px` }}
                  />
                  <span className="text-[9px] font-mono text-slate-400">{bar.qtr}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Occupancy Rate: 96%</span>
            <span className="text-blue-600 dark:text-cyan-400 font-bold">High Absorption</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default MarketInsights;
