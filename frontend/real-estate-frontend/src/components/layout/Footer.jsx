import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, HelpCircle, FileText, Lock } from "lucide-react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white/80 dark:bg-[#0B1120]/90 backdrop-blur-md border-t border-slate-200/80 dark:border-[#334155] py-6 px-4 sm:px-6 lg:px-8 mt-12 transition-colors">
      <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-[#94A3B8]">
        {/* Left Brand & Environment Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck size={16} className="text-blue-600 dark:text-cyan-400" />
            <span>RealEstate Due Diligence Agent</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
            v2.4.0 Enterprise
          </span>
          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Prod Connected
          </span>
        </div>

        {/* Center Legal & Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
          <Link
            to="/admin-dashboard"
            className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <HelpCircle size={13} />
            <span>Support</span>
          </Link>
          <Link
            to="/due-diligence-report"
            className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <FileText size={13} />
            <span>Terms of Service</span>
          </Link>
          <Link
            to="/profile"
            className="hover:text-blue-600 dark:hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <Lock size={13} />
            <span>Privacy Policy</span>
          </Link>
        </div>

        {/* Right Copyright & Build Meta */}
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span>© {currentYear} RealEstate Agent Inc. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
