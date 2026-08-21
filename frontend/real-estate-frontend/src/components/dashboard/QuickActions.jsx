import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  FileText,
  Activity,
  BarChart3,
  Sliders,
  Sparkles,
  Search,
  Eye,
  ShieldCheck,
  Scale,
  TrendingUp,
  Landmark,
  Receipt,
  FileSpreadsheet,
  ClipboardList,
  FolderOpen,
  FileSearch,
  FileCheck2,
} from "lucide-react";
import { showToast } from "../../utils/swal";
import { normalizeRole } from "../../utils/roleUtils";

// 1. BUYER ROLE QUICK ACTIONS
export const BUYER_QUICK_ACTIONS = [
  {
    id: "buyer-search",
    title: "Search Properties",
    subtitle: "Explore Real Estate Catalog",
    tooltip: "Browse, filter and evaluate properties with real-time analytics",
    path: "/property-search",
    icon: Search,
    cardStyle: "bg-blue-50/70 dark:bg-[#0F172A] border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-300 hover:border-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400",
  },
  {
    id: "buyer-watchlist",
    title: "Property Watchlist",
    subtitle: "Monitored Properties",
    tooltip: "Track saved properties and monitor price & clearance changes",
    path: "/watchlist",
    icon: Eye,
    cardStyle: "bg-purple-50/70 dark:bg-[#0F172A] border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:border-purple-500",
    iconBg: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
  },
  {
    id: "buyer-due-diligence",
    title: "Due Diligence",
    subtitle: "Title & Compliance Audit",
    tooltip: "Review 30-year title clearances, zoning, and encumbrance checks",
    path: "/due-diligence-report",
    icon: ShieldCheck,
    cardStyle: "bg-emerald-50/70 dark:bg-[#0F172A] border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:border-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "buyer-risk-assessment",
    title: "Risk Assessment",
    subtitle: "Property Risk Evaluation",
    tooltip: "Inspect legal, environmental, and financial risk scores",
    path: "/risk-assessment",
    icon: Scale,
    cardStyle: "bg-amber-50/70 dark:bg-[#0F172A] border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:border-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  },
  {
    id: "buyer-comparables",
    title: "Comparable Analysis",
    subtitle: "Price & Valuation Comps",
    tooltip: "Compare market values, square footage rates, and recent sales",
    path: "/comparable-properties",
    icon: TrendingUp,
    cardStyle: "bg-cyan-50/70 dark:bg-[#0F172A] border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:border-cyan-500",
    iconBg: "bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "buyer-reports",
    title: "My Reports",
    subtitle: "Diligence History & PDF",
    tooltip: "Access generated due diligence dossiers and export reports",
    path: "/report-history",
    icon: FileText,
    cardStyle: "bg-indigo-50/70 dark:bg-[#0F172A] border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:border-indigo-500",
    iconBg: "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  },
];

// 2. AGENT ROLE QUICK ACTIONS
export const AGENT_QUICK_ACTIONS = [
  {
    id: "agent-my-properties",
    title: "My Listings",
    subtitle: "Managed Properties",
    tooltip: "View and manage properties created and assigned to you",
    path: "/agent/properties",
    icon: Building2,
    cardStyle: "bg-blue-50/70 dark:bg-[#0F172A] border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-300 hover:border-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400",
  },
  {
    id: "agent-clients",
    title: "Client Roster",
    subtitle: "Buyer Relationships",
    tooltip: "Coordinate client due diligence reviews and consultations",
    path: "/agent/clients",
    icon: Users,
    cardStyle: "bg-purple-50/70 dark:bg-[#0F172A] border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:border-purple-500",
    iconBg: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
  },
  {
    id: "agent-dd-requests",
    title: "DD Requests",
    subtitle: "Verification Requests",
    tooltip: "Track pending due diligence requests submitted by clients",
    path: "/agent/requests",
    icon: FileSpreadsheet,
    cardStyle: "bg-emerald-50/70 dark:bg-[#0F172A] border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:border-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "agent-comparables",
    title: "Market Comps",
    subtitle: "Comparative Analysis",
    tooltip: "Run comparative market analysis across catalog properties",
    path: "/comparable-properties",
    icon: TrendingUp,
    cardStyle: "bg-amber-50/70 dark:bg-[#0F172A] border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:border-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  },
  {
    id: "agent-reports",
    title: "Report History",
    subtitle: "Diligence Summaries",
    tooltip: "Access generated client reports and evaluation summaries",
    path: "/report-history",
    icon: FileText,
    cardStyle: "bg-cyan-50/70 dark:bg-[#0F172A] border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:border-cyan-500",
    iconBg: "bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "agent-tasks",
    title: "Tasks & Schedule",
    subtitle: "Pending Action Items",
    tooltip: "Manage property inspection milestones and client follow-ups",
    path: "/agent/tasks",
    icon: ClipboardList,
    cardStyle: "bg-indigo-50/70 dark:bg-[#0F172A] border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:border-indigo-500",
    iconBg: "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  },
];

// 3. LEGAL REVIEWER ROLE QUICK ACTIONS
export const LEGAL_QUICK_ACTIONS = [
  {
    id: "legal-reviews",
    title: "Title Reviews",
    subtitle: "Legal Verification Queue",
    tooltip: "Review pending properties for title clearance and encumbrances",
    path: "/legal/reviews",
    icon: Scale,
    cardStyle: "bg-blue-50/70 dark:bg-[#0F172A] border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-300 hover:border-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400",
  },
  {
    id: "legal-property-review",
    title: "Property Review",
    subtitle: "Document Audit",
    tooltip: "Perform legal check on ownership deeds, land use, and zoning",
    path: "/property-review",
    icon: FileSearch,
    cardStyle: "bg-purple-50/70 dark:bg-[#0F172A] border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:border-purple-500",
    iconBg: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
  },
  {
    id: "legal-checklist",
    title: "Review Checklist",
    subtitle: "Compliance Verification",
    tooltip: "Complete standard legal checklist items for property approval",
    path: "/review-checklist",
    icon: FileCheck2,
    cardStyle: "bg-emerald-50/70 dark:bg-[#0F172A] border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:border-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "legal-risk",
    title: "Risk Assessment",
    subtitle: "Litigation & Dispute Audit",
    tooltip: "Evaluate structural and legal dispute risks on subject parcels",
    path: "/risk-assessment",
    icon: ShieldCheck,
    cardStyle: "bg-amber-50/70 dark:bg-[#0F172A] border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:border-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  },
  {
    id: "legal-reports",
    title: "Review Archive",
    subtitle: "Legal Reports History",
    tooltip: "Inspect past legal due diligence reviews and signed clearances",
    path: "/report-history",
    icon: FileText,
    cardStyle: "bg-cyan-50/70 dark:bg-[#0F172A] border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:border-cyan-500",
    iconBg: "bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "legal-documents",
    title: "Document Vault",
    subtitle: "Deeds & Survey Maps",
    tooltip: "Access title certificates, survey maps, and government records",
    path: "/legal/documents",
    icon: FolderOpen,
    cardStyle: "bg-indigo-50/70 dark:bg-[#0F172A] border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:border-indigo-500",
    iconBg: "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  },
];

// 4. FINANCIAL INSTITUTION ROLE QUICK ACTIONS
export const FINANCIAL_QUICK_ACTIONS = [
  {
    id: "fin-risk",
    title: "Financial Risk",
    subtitle: "LTV & Stress Index",
    tooltip: "Analyze loan-to-value ratios, default risks, and collateral safety",
    path: "/financial-risk",
    icon: Landmark,
    cardStyle: "bg-blue-50/70 dark:bg-[#0F172A] border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-300 hover:border-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400",
  },
  {
    id: "fin-legal-risk",
    title: "Legal Risk Audit",
    subtitle: "Title Risk Score",
    tooltip: "Inspect encumbrances and title status for mortgage clearance",
    path: "/risk-assessment",
    icon: ShieldCheck,
    cardStyle: "bg-purple-50/70 dark:bg-[#0F172A] border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:border-purple-500",
    iconBg: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
  },
  {
    id: "fin-tax",
    title: "Tax Verification",
    subtitle: "Tax Liens & Receipts",
    tooltip: "Verify municipal property tax dues, assessments, and clearances",
    path: "/tax-verification",
    icon: Receipt,
    cardStyle: "bg-emerald-50/70 dark:bg-[#0F172A] border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:border-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "fin-valuation",
    title: "Valuation Comps",
    subtitle: "Market Price Analysis",
    tooltip: "Compare collateral value with real market comps and sales data",
    path: "/comparable-properties",
    icon: TrendingUp,
    cardStyle: "bg-amber-50/70 dark:bg-[#0F172A] border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:border-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  },
  {
    id: "fin-reports",
    title: "Reports History",
    subtitle: "Audit Dossiers",
    tooltip: "Access certified due diligence reports and audit packages",
    path: "/report-history",
    icon: FileText,
    cardStyle: "bg-cyan-50/70 dark:bg-[#0F172A] border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:border-cyan-500",
    iconBg: "bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "fin-analytics",
    title: "Financial Analytics",
    subtitle: "Portfolio Metrics",
    tooltip: "Inspect underwriting volume, approval ratios, and portfolio risk",
    path: "/financial-analytics",
    icon: BarChart3,
    cardStyle: "bg-indigo-50/70 dark:bg-[#0F172A] border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:border-indigo-500",
    iconBg: "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  },
];

// 5. ADMINISTRATOR ROLE QUICK ACTIONS (ONLY FOR ADMINISTRATOR)
export const MASTER_QUICK_ACTIONS = [
  {
    id: "qa-manage-users",
    title: "Manage Users",
    subtitle: "User Accounts & Roles",
    tooltip: "Manage system user accounts, roles & access permissions",
    path: "/user-management",
    icon: Users,
    cardStyle: "bg-blue-50/70 dark:bg-[#0F172A] border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-300 hover:border-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400",
  },
  {
    id: "qa-manage-properties",
    title: "Manage Properties",
    subtitle: "Search & Audit Parcels",
    tooltip: "Search, add & audit collateral property parcels and APNs",
    path: "/property-management",
    icon: Building2,
    cardStyle: "bg-purple-50/70 dark:bg-[#0F172A] border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:border-purple-500",
    iconBg: "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
  },
  {
    id: "qa-view-reports",
    title: "View Reports",
    tooltip: "Access and export financial & legal due diligence audit dossiers",
    subtitle: "Diligence & Audit Dossiers",
    path: "/report-management",
    icon: FileText,
    cardStyle: "bg-emerald-50/70 dark:bg-[#0F172A] border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:border-emerald-500",
    iconBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "qa-audit-logs",
    title: "Audit Logs",
    subtitle: "Telemetry & Time Feed",
    tooltip: "Inspect chronological platform activity & system audit telemetry",
    path: "/recent-activity",
    icon: Activity,
    cardStyle: "bg-amber-50/70 dark:bg-[#0F172A] border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:border-amber-500",
    iconBg: "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
  },
  {
    id: "qa-analytics",
    title: "Analytics",
    subtitle: "Yields & Telemetry Charts",
    tooltip: "View underwriting telemetry, approval rates & financial trends",
    path: "/financial-analytics",
    icon: BarChart3,
    cardStyle: "bg-cyan-50/70 dark:bg-[#0F172A] border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:border-cyan-500",
    iconBg: "bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400",
  },
  {
    id: "qa-system-settings",
    title: "System Settings",
    subtitle: "Infrastructure & Telemetry",
    tooltip: "Inspect system health, server telemetry & infrastructure settings",
    path: "/system-monitoring",
    icon: Sliders,
    cardStyle: "bg-indigo-50/70 dark:bg-[#0F172A] border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:border-indigo-500",
    iconBg: "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  },
];

export const ADMIN_QUICK_ACTIONS = MASTER_QUICK_ACTIONS;
export const FINANCIAL_QUICK_ACTIONS_SUITE = FINANCIAL_QUICK_ACTIONS;

// Single Reusable Quick Action Button Component with Keyboard Accessibility
export function QuickActionButton({ action, onClick }) {
  const IconComp = action.icon || Activity;
  const navigate = useNavigate();

  const handleActionTrigger = (e) => {
    if (e) e.preventDefault();
    
    if (onClick) {
      onClick(action);
    } else if (action.path) {
      showToast(`Opening ${action.title}`, "info");
      navigate(action.path);
    } else {
      showToast(`Triggered ${action.title}`, "info");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleActionTrigger(e);
    }
  };

  return (
    <motion.button
      type="button"
      tabIndex={0}
      title={action.tooltip}
      aria-label={`${action.title}: ${action.tooltip}`}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      onClick={handleActionTrigger}
      onKeyDown={handleKeyDown}
      className={`w-full p-4 rounded-2xl border shadow-xs transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-2.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#1E293B] overflow-hidden min-h-[110px] ${
        action.cardStyle || "bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white"
      }`}
    >
      <div className={`p-2.5 rounded-xl border border-slate-200/60 dark:border-[#334155] shadow-xs ${action.iconBg || "bg-white dark:bg-[#1E293B]"}`}>
        <IconComp size={20} />
      </div>

      <div className="w-full min-w-0 overflow-hidden space-y-0.5">
        <span className="font-extrabold text-xs tracking-tight block truncate text-slate-900 dark:text-white">
          {action.title}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block truncate">
          {action.subtitle || action.tooltip}
        </span>
      </div>
    </motion.button>
  );
}

// Quick Actions Section Grid Wrapper Component with Dynamic Role Awareness
export function QuickActions({ role, actions, title, onActionClick }) {
  // Resolve active role
  const resolvedRole = role || (() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u.role || "Buyer";
    } catch (e) {
      return "Buyer";
    }
  })();

  const normalized = normalizeRole(resolvedRole);

  // Pick appropriate role-specific actions if not explicitly passed
  const resolvedActions = actions || (() => {
    switch (normalized) {
      case "agent":
        return AGENT_QUICK_ACTIONS;
      case "legal":
        return LEGAL_QUICK_ACTIONS;
      case "financial":
        return FINANCIAL_QUICK_ACTIONS;
      case "admin":
        return ADMIN_QUICK_ACTIONS;
      case "buyer":
      default:
        return BUYER_QUICK_ACTIONS;
    }
  })();

  const defaultTitle = (() => {
    switch (normalized) {
      case "agent":
        return "Agent Workspace Quick Actions";
      case "legal":
        return "Legal Review Quick Actions";
      case "financial":
        return "Underwriting & Risk Quick Actions";
      case "admin":
        return "Platform Quick Actions Workstation";
      case "buyer":
      default:
        return "Buyer Quick Actions Workstation";
    }
  })();

  return (
    <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles size={16} className="text-blue-500" /> {title || defaultTitle}
        </h2>
        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 text-[10px] font-bold border border-blue-200 dark:border-blue-800">
          {resolvedActions.length} SHORTCUTS
        </span>
      </div>

      {/* RESPONSIVE GRID LAYOUT: 2 COLS MOBILE, 3 COLS TABLET, 6 COLS DESKTOP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 items-stretch">
        {resolvedActions.map((action) => (
          <QuickActionButton key={action.id || action.title} action={action} onClick={onActionClick} />
        ))}
      </div>
    </div>
  );
}

export default QuickActions;