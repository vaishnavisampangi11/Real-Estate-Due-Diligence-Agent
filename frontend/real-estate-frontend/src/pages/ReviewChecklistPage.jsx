import React from "react";
import MainLayout from "../components/layout/MainLayout";
import ReviewChecklist from "../components/legal/ReviewChecklist";
import PropertyContextSwitcher from "../components/common/PropertyContextSwitcher";
import { useSearchParams } from "react-router-dom";
import { getLiveActiveProperty } from "../services/liveStore";
import { Home, FileCheck2 } from "lucide-react";

function ReviewChecklistPage() {
  const [searchParams] = useSearchParams();
  const activeProp = getLiveActiveProperty(searchParams.get("id") || searchParams.get("propertyId"));
  const numericId = (activeProp?.numericId || activeProp?.propertyId || 1001).toString();
  const propertyTitle = activeProp?.propertyName || activeProp?.title || "Gachibowli Tech Park Phase 2";

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <Home size={14} className="text-blue-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Sub-Registrar Legal Review Checklist
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-800">
            PR-{numericId} • AUDIT CHECKLIST ACTIVE
          </span>
        </div>

        {/* PROPERTY CONTEXT SWITCHER BAR */}
        <PropertyContextSwitcher currentPropertyId={numericId} />

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold mb-2">
              <FileCheck2 size={14} /> Legal Audit Gateways
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              📋 Due Diligence Review Checklist
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              Audit status for <strong className="text-slate-900 dark:text-white">{propertyTitle}</strong> (PR-{numericId}).
            </p>
          </div>
        </div>

        {/* REUSABLE REVIEW CHECKLIST COMPONENT */}
        <ReviewChecklist propertyId={numericId} />
      </div>
    </MainLayout>
  );
}

export default ReviewChecklistPage;
