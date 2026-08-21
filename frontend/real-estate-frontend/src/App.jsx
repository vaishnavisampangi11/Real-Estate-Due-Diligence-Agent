import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import LegalDashboard from "./pages/LegalDashboard";
import FinancialDashboard from "./pages/FinancialDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";
import PropertyManagement from "./pages/PropertyManagement";
import ReportManagement from "./pages/ReportManagement";
import SystemMonitoring from "./pages/SystemMonitoring";
import NotificationsCenter from "./pages/NotificationsCenter";
import SecurityCenter from "./pages/SecurityCenter";
import DataManagement from "./pages/DataManagement";

// Dedicated Role Sub-Pages
import SavedProperties from "./pages/SavedProperties";
import AgentClients from "./pages/AgentClients";
import ClientProfile from "./pages/ClientProfile";
import AgentProperties from "./pages/AgentProperties";
import AgentRequests from "./pages/AgentRequests";
import AgentTasks from "./pages/AgentTasks";
import AgentCalendar from "./pages/AgentCalendar";
import AgentAnalytics from "./pages/AgentAnalytics";
import RecentActivity from "./pages/RecentActivity";
import LegalReviews from "./pages/LegalReviews";
import PropertyReview from "./pages/PropertyReview";
import ReviewChecklistPage from "./pages/ReviewChecklistPage";
import CaseHistory from "./pages/CaseHistory";
import LegalAnalytics from "./pages/LegalAnalytics";
import PropertyValuation from "./pages/PropertyValuation";
import FinancialRiskAnalysis from "./pages/FinancialRiskAnalysis";
import FinancialReports from "./pages/FinancialReports";
import LoanReview from "./pages/LoanReview";
import FinancialAnalytics from "./pages/FinancialAnalytics";
import LegalDocuments from "./pages/LegalDocuments";
import FinancialLoans from "./pages/FinancialLoans";

import PropertySearch from "./pages/PropertySearch";
import PropertyDetails from "./pages/PropertyDetails";
import Ownership from "./pages/Ownership";
import TaxHistory from "./pages/TaxHistory";
import TaxVerification from "./pages/TaxVerification";
import Zoning from "./pages/Zoning";
import FloodZone from "./pages/FloodZone";
import Environmental from "./pages/Environmental";
import PermitRecords from "./pages/PermitRecords";
import Utilities from "./pages/Utilities";
import Profile from "./pages/Profile";

// Milestone 3 Pages
import RiskAssessment from "./pages/RiskAssessment";
import ComparableProperties from "./pages/ComparableProperties";
import DueDiligenceReport from "./pages/DueDiligenceReport";
import NotificationCenter from "./pages/NotificationCenter";
import ReportHistory from "./pages/ReportHistory";
import PropertyWatchlist from "./pages/PropertyWatchlist";
import MyAccount from "./pages/MyAccount";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import CompleteOAuthRegistration from "./pages/CompleteOAuthRegistration";

import ProtectedRoute from "./components/common/ProtectedRoute";
import { getCurrentUserRole, getRoleDashboardPath } from "./utils/roleUtils";

// Redirects /dashboard to role-specific path
function RoleDashboardRedirect() {
  const userRole = getCurrentUserRole();
  const targetPath = getRoleDashboardPath(userRole);
  return <Navigate to={targetPath} replace />;
}

function App() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
      <Route path="/complete-oauth-registration" element={<CompleteOAuthRegistration />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Generic /dashboard redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleDashboardRedirect />
          </ProtectedRoute>
        }
      />

      {/* 5 SRS Role-Based Dashboard Routes */}
      <Route
        path="/buyer/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Buyer", "Administrator"]}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved-properties"
        element={
          <ProtectedRoute allowedRoles={["Buyer", "Administrator"]}>
            <SavedProperties />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agent/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Real Estate Agent", "Administrator"]}>
            <AgentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/clients"
        element={
          <ProtectedRoute allowedRoles={["Real Estate Agent", "Administrator"]}>
            <AgentClients />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/client-profile"
        element={
          <ProtectedRoute>
            <ClientProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client-profile"
        element={
          <ProtectedRoute>
            <ClientProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/properties"
        element={
          <ProtectedRoute allowedRoles={["Real Estate Agent", "Administrator"]}>
            <AgentProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/my-properties"
        element={
          <ProtectedRoute allowedRoles={["Real Estate Agent", "Administrator"]}>
            <AgentProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-properties"
        element={
          <ProtectedRoute allowedRoles={["Real Estate Agent", "Administrator"]}>
            <AgentProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/requests"
        element={
          <ProtectedRoute allowedRoles={["Real Estate Agent", "Administrator"]}>
            <AgentRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/due-diligence-requests"
        element={
          <ProtectedRoute allowedRoles={["Real Estate Agent", "Legal Reviewer", "Administrator"]}>
            <AgentRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/tasks"
        element={
          <ProtectedRoute allowedRoles={["Real Estate Agent", "Administrator"]}>
            <AgentTasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/calendar"
        element={
          <ProtectedRoute>
            <AgentCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <AgentCalendar />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/analytics"
        element={
          <ProtectedRoute>
            <AgentAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AgentAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agent/activity"
        element={
          <ProtectedRoute>
            <RecentActivity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activity"
        element={
          <ProtectedRoute>
            <RecentActivity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recent-activity"
        element={
          <ProtectedRoute>
            <RecentActivity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/activity"
        element={
          <ProtectedRoute>
            <RecentActivity />
          </ProtectedRoute>
        }
      />

      <Route
        path="/legal/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Legal Reviewer", "Administrator"]}>
            <LegalDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/legal/reviews"
        element={
          <ProtectedRoute allowedRoles={["Legal Reviewer", "Administrator"]}>
            <LegalReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute allowedRoles={["Legal Reviewer", "Administrator"]}>
            <LegalReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/legal/property-review"
        element={
          <ProtectedRoute allowedRoles={["Legal Reviewer", "Administrator"]}>
            <PropertyReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/property-review"
        element={
          <ProtectedRoute allowedRoles={["Legal Reviewer", "Administrator"]}>
            <PropertyReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/legal/checklist"
        element={
          <ProtectedRoute allowedRoles={["Legal Reviewer", "Administrator"]}>
            <ReviewChecklistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/review-checklist"
        element={
          <ProtectedRoute allowedRoles={["Legal Reviewer", "Administrator"]}>
            <ReviewChecklistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/legal/history"
        element={
          <ProtectedRoute allowedRoles={["Legal Reviewer", "Administrator"]}>
            <CaseHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/case-history"
        element={
          <ProtectedRoute allowedRoles={["Legal Reviewer", "Administrator"]}>
            <CaseHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/legal/analytics"
        element={
          <ProtectedRoute>
            <LegalAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <LegalAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Financial Institution", "Administrator"]}>
            <FinancialDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/valuation"
        element={
          <ProtectedRoute>
            <PropertyValuation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/property-valuation"
        element={
          <ProtectedRoute>
            <PropertyValuation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/risk"
        element={
          <ProtectedRoute>
            <FinancialRiskAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-risk"
        element={
          <ProtectedRoute>
            <FinancialRiskAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-verification"
        element={
          <ProtectedRoute>
            <TaxVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-history"
        element={
          <ProtectedRoute>
            <TaxVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/reports"
        element={
          <ProtectedRoute>
            <FinancialReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-reports"
        element={
          <ProtectedRoute>
            <FinancialReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comparable-properties"
        element={
          <ProtectedRoute>
            <ComparableProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compare-properties"
        element={
          <ProtectedRoute>
            <ComparableProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-review"
        element={
          <ProtectedRoute>
            <LoanReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/loan-review"
        element={
          <ProtectedRoute>
            <LoanReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/notifications"
        element={
          <ProtectedRoute>
            <NotificationsCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-analytics"
        element={
          <ProtectedRoute>
            <FinancialAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <FinancialAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/analytics"
        element={
          <ProtectedRoute>
            <FinancialAnalytics />
          </ProtectedRoute>
        }
      />
      <Route path="/help-support" element={<Navigate to="/financial/dashboard" replace />} />
      <Route path="/help" element={<Navigate to="/financial/dashboard" replace />} />
      <Route path="/support" element={<Navigate to="/financial/dashboard" replace />} />
      <Route path="/financial/help" element={<Navigate to="/financial/dashboard" replace />} />
      <Route
        path="/legal/documents"
        element={
          <ProtectedRoute allowedRoles={["Legal Reviewer", "Administrator"]}>
            <LegalDocuments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <LegalDocuments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/financial/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Financial Institution", "Administrator"]}>
            <FinancialDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial/loans"
        element={
          <ProtectedRoute allowedRoles={["Financial Institution", "Administrator"]}>
            <FinancialLoans />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/user-management"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/role-management"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <RoleManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/roles"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <RoleManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/roles"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <RoleManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/property-management"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <PropertyManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/properties"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <PropertyManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-properties"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <PropertyManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/report-management"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <ReportManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <ReportManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manage-reports"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <ReportManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/system-monitoring"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <SystemMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/system"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <SystemMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-settings"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <SystemMonitoring />
          </ProtectedRoute>
        }
      />
      <Route
        path="/system-health"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <SystemMonitoring />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <NotificationsCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications-center"
        element={
          <ProtectedRoute>
            <NotificationsCenter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/security-center"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <SecurityCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/security"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <SecurityCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <SecurityCenter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/data-management"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <DataManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/data"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <DataManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/export-data"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <DataManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/platform-settings"
        element={
          <ProtectedRoute>
            <MyAccount />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute>
            <MyAccount />
          </ProtectedRoute>
        }
      />

      <Route path="/admin/help" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Financial, Reports, Analytics & Activity Routes */}
      <Route
        path="/financial-reports"
        element={
          <ProtectedRoute>
            <FinancialReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <FinancialReports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-analytics"
        element={
          <ProtectedRoute>
            <FinancialAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <FinancialAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute>
            <FinancialAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recent-activity"
        element={
          <ProtectedRoute>
            <RecentActivity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <RecentActivity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute>
            <RecentActivity />
          </ProtectedRoute>
        }
      />
      <Route
        path="/financial-risk"
        element={
          <ProtectedRoute>
            <FinancialRiskAnalysis />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-verification"
        element={
          <ProtectedRoute>
            <TaxVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/property-valuation"
        element={
          <ProtectedRoute>
            <PropertyValuation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/loan-review"
        element={
          <ProtectedRoute>
            <LoanReview />
          </ProtectedRoute>
        }
      />

      {/* Additional Feature & Diligence Routes */}
      <Route
        path="/property-search"
        element={
          <ProtectedRoute>
            <PropertySearch />
          </ProtectedRoute>
        }
      />
      <Route
        path="/property-details"
        element={
          <ProtectedRoute>
            <PropertyDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/property-details/:id"
        element={
          <ProtectedRoute>
            <PropertyDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties/:id"
        element={
          <ProtectedRoute>
            <PropertyDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/property/:id"
        element={
          <ProtectedRoute>
            <PropertyDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties"
        element={<Navigate to="/property-search" replace />}
      />
      <Route
        path="/search"
        element={<Navigate to="/property-search" replace />}
      />
      <Route
        path="/risk-assessment"
        element={
          <ProtectedRoute>
            <RiskAssessment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/comparable-properties"
        element={
          <ProtectedRoute>
            <ComparableProperties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/due-diligence-report"
        element={
          <ProtectedRoute>
            <DueDiligenceReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report-history"
        element={
          <ProtectedRoute>
            <ReportHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-reports"
        element={
          <ProtectedRoute>
            <ReportHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/report-center"
        element={
          <ProtectedRoute>
            <ReportHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/watchlist"
        element={
          <ProtectedRoute>
            <PropertyWatchlist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/property-watchlist"
        element={
          <ProtectedRoute>
            <PropertyWatchlist />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recommended-properties"
        element={<Navigate to="/property-search" replace />}
      />
      <Route
        path="/recommendations"
        element={<Navigate to="/property-search" replace />}
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["Administrator"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Record Registries */}
      <Route
        path="/ownership"
        element={
          <ProtectedRoute>
            <Ownership />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-history"
        element={
          <ProtectedRoute>
            <TaxHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/zoning"
        element={
          <ProtectedRoute>
            <Zoning />
          </ProtectedRoute>
        }
      />
      <Route
        path="/flood-zone"
        element={
          <ProtectedRoute>
            <FloodZone />
          </ProtectedRoute>
        }
      />
      <Route
        path="/environmental"
        element={
          <ProtectedRoute>
            <Environmental />
          </ProtectedRoute>
        }
      />
      <Route
        path="/permit-records"
        element={
          <ProtectedRoute>
            <PermitRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/utilities"
        element={
          <ProtectedRoute>
            <Utilities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MyAccount />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-account"
        element={
          <ProtectedRoute>
            <MyAccount />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <MyAccount />
          </ProtectedRoute>
        }
      />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;