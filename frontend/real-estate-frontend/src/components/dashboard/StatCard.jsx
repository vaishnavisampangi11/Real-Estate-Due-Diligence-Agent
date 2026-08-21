import React from "react";
import {
  Building,
  ShieldCheck,
  AlertTriangle,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  Building2,
  FileText,
  Search,
  Users,
  CheckCircle2,
  UserX,
  AlertOctagon,
  Landmark,
  FileCheck,
  Activity,
  PlusCircle,
  FileSpreadsheet,
} from "lucide-react";

const ICON_MAP = {
  Building,
  ShieldCheck,
  AlertTriangle,
  Award,
  Clock,
  Building2,
  FileText,
  Search,
  Users,
  CheckCircle2,
  UserX,
  AlertOctagon,
  Landmark,
  FileCheck,
  Activity,
  PlusCircle,
  FileSpreadsheet,
};

function StatCard({ stats: customStats }) {
  const defaultStats = [
    {
      title: "Total Properties Audited",
      value: "1,240",
      change: "+12.4%",
      isPositive: true,
      period: "vs last month",
      icon: Building,
      cardStyle: "bg-blue-50/60 dark:bg-[#1E293B] border-blue-200/80 dark:border-[#334155] border-l-4 border-l-blue-500",
      iconBg: "bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800",
    },
    {
      title: "Verified Clear Titles",
      value: "980",
      change: "+8.2%",
      isPositive: true,
      period: "vs last month",
      icon: ShieldCheck,
      cardStyle: "bg-emerald-50/60 dark:bg-[#1E293B] border-emerald-200/80 dark:border-[#334155] border-l-4 border-l-emerald-500",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800",
    },
    {
      title: "Tax Audit / Pending",
      value: "215",
      change: "-1.5%",
      isPositive: true,
      period: "vs last month",
      icon: Clock,
      cardStyle: "bg-amber-50/60 dark:bg-[#1E293B] border-amber-200/80 dark:border-[#334155] border-l-4 border-l-amber-500",
      iconBg: "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800",
    },
    {
      title: "High Risk Flagged",
      value: "45",
      change: "-3.1%",
      isPositive: true,
      period: "vs last month",
      icon: AlertTriangle,
      cardStyle: "bg-rose-50/60 dark:bg-[#1E293B] border-rose-200/80 dark:border-[#334155] border-l-4 border-l-rose-500",
      iconBg: "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800",
    },
  ];

  const stats = customStats || defaultStats;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, index) => {
        let Icon = stat.icon;
        if (!Icon && stat.iconName && ICON_MAP[stat.iconName]) {
          Icon = ICON_MAP[stat.iconName];
        }
        if (!Icon) Icon = Building;

        const TrendIcon = stat.isPositive === false ? TrendingDown : TrendingUp;

        return (
          <div
            key={index}
            className={`rounded-2xl p-6 border shadow-xs hover-lift group transition-all duration-200 ${stat.cardStyle || "bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155]"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-[#CBD5E1]">
                {stat.title}
              </span>
              <div className={`p-2.5 rounded-xl border ${stat.iconBg || "bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400"}`}>
                <Icon size={18} />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                {stat.value}
              </h3>
            </div>

            {stat.change && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-200/60 dark:border-[#334155]">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                    stat.isPositive !== false
                      ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      : "bg-red-100 dark:bg-rose-950/80 text-red-800 dark:text-rose-300 border border-red-200 dark:border-rose-800"
                  }`}
                >
                  <TrendIcon size={13} />
                  {stat.change}
                </span>
                {stat.period && (
                  <span className="text-xs text-slate-500 dark:text-[#94A3B8] font-medium">
                    {stat.period}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default StatCard;