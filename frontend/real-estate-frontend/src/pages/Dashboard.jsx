import React from "react";
import MainLayout from "../components/layout/MainLayout";
import DashboardHeroHeader from "../components/dashboard/DashboardHeroHeader";
import DashboardKPIGrid from "../components/dashboard/DashboardKPIGrid";
import DashboardQuickActions from "../components/dashboard/QuickActions"; // Preserves existing component export
import DashboardActionsGrid from "../components/dashboard/DashboardQuickActions";
import PropertySearchPanel from "../components/dashboard/PropertySearchPanel";
import ActiveReportsTable from "../components/dashboard/ActiveReportsTable";
import RiskCenterPanel from "../components/dashboard/RiskCenterPanel";
import AnalyticsSection from "../components/dashboard/AnalyticsSection";
import SavedPropertiesGrid from "../components/dashboard/SavedPropertiesGrid";
import AIInsightsPanel from "../components/dashboard/AIInsightsPanel";
import RecentActivityFeed from "../components/dashboard/RecentActivityFeed";
import DashboardNotificationCenter from "../components/dashboard/DashboardNotificationCenter";
import ProfileSummaryCard from "../components/dashboard/ProfileSummaryCard";
import RecentDocumentsPanel from "../components/dashboard/RecentDocumentsPanel";
import { Home, Command } from "lucide-react";

function Dashboard() {
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = storedUser.firstName
    ? `${storedUser.firstName} ${storedUser.lastName || ""}`.trim()
    : storedUser.name || (storedUser.email ? storedUser.email.split("@")[0] : "User");
  const userRole = storedUser.role || "Buyer";

  return (
    <MainLayout>
      <div className="space-y-8 pb-12">
        {/* Top Breadcrumb & Keyboard Hint */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <Home size={14} className="text-slate-400 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Executive Dashboard Overview
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-[#0F172A] px-2.5 py-1 rounded-xl border border-slate-200 dark:border-[#334155]">
            <Command size={12} className="text-blue-500" /> Press <kbd className="font-bold text-slate-700 dark:text-slate-300">Ctrl + K</kbd> for Command Palette
          </div>
        </div>

        {/* 1. HERO HEADER */}
        <DashboardHeroHeader userName={userName} userRole={userRole} />

        {/* 3. KPI DASHBOARD */}
        <DashboardKPIGrid />

        {/* 2. QUICK ACTIONS */}
        <DashboardActionsGrid />

        {/* 4. PROPERTY SEARCH PANEL */}
        <PropertySearchPanel />

        {/* Main Grid Section: 2 Columns Layout (8 cols + 4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Left Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 5. ACTIVE REPORTS TABLE */}
            <ActiveReportsTable />

            {/* 7. RECHARTS ANALYTICS SECTION */}
            <AnalyticsSection />

            {/* 6. RISK CENTER PANEL */}
            <RiskCenterPanel />

            {/* 8. SAVED PROPERTIES GRID */}
            <SavedPropertiesGrid />

            {/* Preserved Quick Actions Section for Complete Backwards Compatibility */}
            <DashboardQuickActions role={userRole} />
          </div>

          {/* Right Sidebar Widgets Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-8">
            {/* 12. PROFILE SUMMARY CARD */}
            <ProfileSummaryCard userName={userName} userRole={userRole} />

            {/* 10. AI INSIGHTS PANEL */}
            <AIInsightsPanel />

            {/* 11. NOTIFICATION CENTER */}
            <DashboardNotificationCenter />

            {/* 9. RECENT ACTIVITY TIMELINE */}
            <RecentActivityFeed />

            {/* 13. RECENT DOCUMENTS */}
            <RecentDocumentsPanel />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Dashboard;