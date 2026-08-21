import React from "react";
import { motion } from "framer-motion";
import {
  PlusCircle,
  UserCheck,
  Receipt,
  Waves,
  Leaf,
  Activity,
  FileCheck,
  Download,
  Building2,
  Clock,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Badge from "../common/Badge";

/**
 * Reusable Vertical Responsive Property Timeline Component
 * Renders the 8 specified due diligence timeline events with distinct icons.
 */
function PropertyTimeline({ propertyId = "PR-1001", propertyName = "Gachibowli Tech Park Phase 2" }) {
  const timelineEvents = [
    {
      id: "evt-1",
      step: 1,
      title: "Property Added",
      description: "Property parcel registered in Sub-Registrar GIS portal & assigned APN ID.",
      timestamp: "01 Aug 2026, 09:00 AM",
      status: "Completed",
      variant: "success",
      icon: PlusCircle,
      iconBg: "bg-blue-600 text-white",
      borderColor: "border-blue-500",
    },
    {
      id: "evt-2",
      step: 2,
      title: "Ownership Verified",
      description: "30-Year Title Deed chain & Nil Encumbrance Certificate (EC) verified.",
      timestamp: "01 Aug 2026, 11:30 AM",
      status: "Verified Clear",
      variant: "success",
      icon: UserCheck,
      iconBg: "bg-emerald-600 text-white",
      borderColor: "border-emerald-500",
    },
    {
      id: "evt-3",
      step: 3,
      title: "Tax Records Retrieved",
      description: "Municipal property tax assessment receipts retrieved through AY 2024-25.",
      timestamp: "02 Aug 2026, 02:15 PM",
      status: "Fully Paid",
      variant: "success",
      icon: Receipt,
      iconBg: "bg-indigo-600 text-white",
      borderColor: "border-indigo-500",
    },
    {
      id: "evt-4",
      step: 4,
      title: "Flood Check",
      description: "FIRM Hydrological Survey completed: Designated Zone X (Unshaded safe elevation).",
      timestamp: "02 Aug 2026, 04:45 PM",
      status: "Zone X Safe",
      variant: "success",
      icon: Waves,
      iconBg: "bg-cyan-600 text-white",
      borderColor: "border-cyan-500",
    },
    {
      id: "evt-5",
      step: 5,
      title: "Environmental Check",
      description: "State Pollution Control Board soil NOC & heavy metal contamination test cleared.",
      timestamp: "03 Aug 2026, 10:20 AM",
      status: "Cleared",
      variant: "success",
      icon: Leaf,
      iconBg: "bg-teal-600 text-white",
      borderColor: "border-teal-500",
    },
    {
      id: "evt-6",
      step: 6,
      title: "Risk Calculated",
      description: "13-Vector AI Compliance Index computed: 86 / 100 (Low Acquisition Risk).",
      timestamp: "03 Aug 2026, 01:10 PM",
      status: "Low Risk",
      variant: "success",
      icon: Activity,
      iconBg: "bg-purple-600 text-white",
      borderColor: "border-purple-500",
    },
    {
      id: "evt-7",
      step: 7,
      title: "Report Generated",
      description: "Institutional Due Diligence Audit Certificate compiled with encrypted SHA-256 seal.",
      timestamp: "04 Aug 2026, 09:30 AM",
      status: "Certified",
      variant: "success",
      icon: FileCheck,
      iconBg: "bg-amber-600 text-white",
      borderColor: "border-amber-500",
    },
    {
      id: "evt-8",
      step: 8,
      title: "Download Available",
      description: "Formal 13-section PDF due diligence certificate ready for instant download.",
      timestamp: "04 Aug 2026, 10:00 AM",
      status: "Ready for Download",
      variant: "success",
      icon: Download,
      iconBg: "bg-emerald-600 text-white animate-pulse",
      borderColor: "border-emerald-500",
    },
  ];

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6">
      {/* Timeline Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#334155]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold mb-2">
            <Clock size={14} /> Audit Lifecycle Milestone Stream
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <ShieldCheck size={22} className="text-blue-600 dark:text-cyan-400" /> Property Audit Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1">
            Chronological audit verification log for <strong className="text-slate-900 dark:text-white">{propertyName}</strong> ({propertyId}).
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 shrink-0">
          <CheckCircle2 size={14} /> 8 / 8 AUDIT STEPS COMPLETED
        </span>
      </div>

      {/* Vertical Responsive Timeline Container */}
      <div className="relative pl-4 sm:pl-8 space-y-8 before:absolute before:left-7 sm:before:left-11 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 dark:before:bg-[#334155]">
        {timelineEvents.map((evt, idx) => {
          const Icon = evt.icon;

          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="relative flex items-start gap-4 sm:gap-6 group"
            >
              {/* Vertical Icon Node Badge */}
              <div
                className={`relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${evt.iconBg} flex items-center justify-center shadow-md font-bold shrink-0 transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon size={20} />
              </div>

              {/* Event Content Card */}
              <div
                className={`flex-1 p-5 rounded-2xl bg-slate-50/80 dark:bg-[#0F172A]/80 border border-slate-200/80 dark:border-[#334155] border-l-4 ${evt.borderColor} hover:border-blue-400 shadow-xs hover:shadow-md transition-all duration-200 space-y-2`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      STEP 0{evt.step}
                    </span>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                      {evt.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> {evt.timestamp}
                    </span>
                    <Badge variant={evt.variant} className="text-[10px]">
                      {evt.status}
                    </Badge>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {evt.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default PropertyTimeline;
