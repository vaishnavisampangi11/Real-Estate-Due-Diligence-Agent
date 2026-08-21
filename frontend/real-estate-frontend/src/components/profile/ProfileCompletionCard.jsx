import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

function ProfileCompletionCard({ completionPercentage = 50, onCompleteClick }) {
  const safePct = Math.min(100, Math.max(0, completionPercentage || 0));

  // SVG circle calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safePct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-[#334155] shadow-lg relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Animated Circular Progress Gauge */}
        <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track Circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-slate-200 dark:text-slate-700/60"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress Fill Circle */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              className="text-blue-600 dark:text-cyan-400"
              strokeWidth="10"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          {/* Percentage Text Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
              {safePct}%
            </span>
            <span className="text-[9px] font-bold text-slate-400 dark:text-[#94A3B8] uppercase mt-0.5 tracking-wider">
              Done
            </span>
          </div>
        </div>

        {/* Informational Text & CTA */}
        <div className="flex-1 text-center sm:text-left space-y-1.5 font-mono">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles size={16} className="text-blue-600 dark:text-cyan-400" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-[#F8FAFC]">
              Profile Completion
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-[#CBD5E1] max-w-lg leading-relaxed font-mono">
            {safePct >= 100
              ? "Your profile is complete."
              : "Complete your profile to provide additional account information."}
          </p>

          {safePct < 100 && (
            <button
              onClick={onCompleteClick}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300 pt-1 group cursor-pointer"
            >
              <span>Complete profile details</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProfileCompletionCard;
