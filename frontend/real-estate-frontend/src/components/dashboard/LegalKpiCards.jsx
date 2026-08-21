import React from "react";
import { motion } from "framer-motion";
import {
  Clock,
  ShieldCheck,
  ShieldAlert,
  UserX,
  FolderClock,
  Calendar,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

// Icon Resolver
const ICON_MAP = {
  Clock: Clock,
  ShieldCheck: ShieldCheck,
  ShieldAlert: ShieldAlert,
  UserX: UserX,
  FolderClock: FolderClock,
  Calendar: Calendar,
};

function LegalKpiCards({ cards = [] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const IconComponent = ICON_MAP[card.iconName] || Clock;

        return (
          <motion.div
            key={card.id || index}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-4 cursor-pointer"
          >
            {/* Header Icon & Title */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-2xl border shrink-0 ${card.iconColor}`}>
                <IconComponent size={18} />
              </div>
            </div>

            {/* Count & Trend */}
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                {card.count}
              </h3>
              <p className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <ArrowUpRight size={13} className="text-emerald-500 shrink-0" />
                <span className="truncate">{card.trend}</span>
              </p>
            </div>

            {/* Footer Timestamp */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{card.lastUpdated}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default LegalKpiCards;
