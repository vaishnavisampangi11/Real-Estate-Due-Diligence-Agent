import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Award,
  TrendingUp,
  TrendingDown,
  Landmark,
  FileSpreadsheet,
  Calculator,
  ShieldCheck,
} from "lucide-react";

// Initial state JSON Data for the 6 specified KPI cards
const FINANCIAL_KPI_DEFAULT_DATA = [
  {
    id: "kpi-1",
    title: "Pending Loan Requests",
    count: "0 Applications",
    trend: "Live Database",
    isPositive: true,
    lastUpdated: "Real-time",
    icon: Clock,
    colorStyle: "bg-blue-50/60 dark:bg-[#1E293B] border-blue-200/80 dark:border-[#334155] border-l-4 border-l-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border-blue-300 dark:border-blue-800",
  },
  {
    id: "kpi-2",
    title: "Approved Loans",
    count: "0 Loans",
    trend: "Live Database",
    isPositive: true,
    lastUpdated: "Real-time",
    icon: CheckCircle2,
    colorStyle: "bg-emerald-50/60 dark:bg-[#1E293B] border-emerald-200/80 dark:border-[#334155] border-l-4 border-l-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
  },
  {
    id: "kpi-3",
    title: "High Risk Properties",
    count: "0 Properties",
    trend: "Live Database",
    isPositive: true,
    lastUpdated: "Real-time",
    icon: AlertTriangle,
    colorStyle: "bg-rose-50/60 dark:bg-[#1E293B] border-rose-200/80 dark:border-[#334155] border-l-4 border-l-rose-500",
    iconBg: "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800",
  },
  {
    id: "kpi-4",
    title: "Reports Generated",
    count: "0 Reports",
    trend: "Live Database",
    isPositive: true,
    lastUpdated: "Real-time",
    icon: FileSpreadsheet,
    colorStyle: "bg-purple-50/60 dark:bg-[#1E293B] border-purple-200/80 dark:border-[#334155] border-l-4 border-l-purple-500",
    iconBg: "bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800",
  },
  {
    id: "kpi-5",
    title: "Average Loan Amount",
    count: "₹ 0.00 Cr",
    trend: "Live Database",
    isPositive: true,
    lastUpdated: "Real-time",
    icon: DollarSign,
    colorStyle: "bg-cyan-50/60 dark:bg-[#1E293B] border-cyan-200/80 dark:border-[#334155] border-l-4 border-l-cyan-500",
    iconBg: "bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800",
  },
  {
    id: "kpi-6",
    title: "Investment Grade Rating",
    count: "Grade A",
    trend: "Live Database",
    isPositive: true,
    lastUpdated: "Real-time",
    icon: Award,
    colorStyle: "bg-amber-50/60 dark:bg-[#1E293B] border-amber-200/80 dark:border-[#334155] border-l-4 border-l-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800",
  },
];

function FinancialKpiCards({ cards = FINANCIAL_KPI_DEFAULT_DATA }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
      {cards.map((card) => {
        const IconComp = card.icon || Landmark;
        const TrendIcon = card.isPositive ? TrendingUp : TrendingDown;

        return (
          <motion.div
            key={card.id}
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className={`rounded-3xl p-6 border shadow-xs transition-all duration-200 group cursor-pointer ${
              card.colorStyle || "bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155]"
            }`}
          >
            {/* Header: Title & Icon */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-[#CBD5E1]">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-2xl border transition-transform group-hover:scale-105 ${
                card.iconBg || "bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400"
              }`}>
                <IconComp size={18} />
              </div>
            </div>

            {/* Count / Value */}
            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                {card.count}
              </h3>
            </div>

            {/* Trend & Last Updated */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200/60 dark:border-[#334155] text-[11px]">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                  card.isPositive !== false
                    ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                <TrendIcon size={12} />
                {card.trend}
              </span>

              <span className="text-slate-400 font-bold text-[10px]">
                {card.lastUpdated}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default FinancialKpiCards;
