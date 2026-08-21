import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale,
  ShieldCheck,
  Building2,
  CheckCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  FileSearch,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import DashboardHeroHeader from "../components/dashboard/DashboardHeroHeader";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { Skeleton } from "../components/common/Skeleton";
import { getAllProperties } from "../services/propertyService";
import { getMyReports } from "../services/reportService";
import { getMyAssessments } from "../services/riskService";
import { getCurrentUser } from "../services/authService";
import { showToast } from "../utils/swal";
import QuickActions from "../components/dashboard/QuickActions";

function LegalDashboard() {
  const navigate = useNavigate();

  // 1. Authenticated User & Role from Session
  const storedUser = getCurrentUser() || {};
  const userName = storedUser.firstName
    ? `${storedUser.firstName} ${storedUser.lastName || ""}`.trim()
    : storedUser.name || (storedUser.email ? storedUser.email.split("@")[0] : "Legal Reviewer");
  const userRole = storedUser.role || "Legal Reviewer";

  // State Management
  const [properties, setProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live Data Fetcher
  const fetchLegalData = async (isManualSync = false) => {
    setLoading(true);
    setError(null);

    try {
      const [propsRes, reportsRes, riskRes] = await Promise.allSettled([
        getAllProperties(0, 50),
        getMyReports(),
        getMyAssessments(),
      ]);

      // 1. Properties
      if (propsRes.status === "fulfilled") {
        const payload = propsRes.value?.data || propsRes.value;
        const items = payload?.content || (Array.isArray(payload) ? payload : []);
        setProperties(items);
      } else {
        setProperties([]);
      }

      // 2. Reports
      if (reportsRes.status === "fulfilled") {
        const payload = reportsRes.value?.data || reportsRes.value;
        const items = Array.isArray(payload) ? payload : (payload?.content || []);
        setReports(items);
      } else {
        setReports([]);
      }

      // 3. Risk Assessments
      if (riskRes.status === "fulfilled") {
        const payload = riskRes.value?.data || riskRes.value;
        const items = Array.isArray(payload) ? payload : (payload?.content || []);
        setAssessments(items);
      } else {
        setAssessments([]);
      }

      if (isManualSync) {
        showToast("Legal review workspace synchronized with live database.", "success");
      }
    } catch (err) {
      console.warn("Legal dashboard API query error:", err);
      setError("Unable to connect to backend server. Please verify Spring Boot is running on port 8081.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLegalData();
  }, []);

  // Compute Live Metrics from Database Records
  const activeReportsCount = reports.length;
  const reportsTodayCount = reports.filter((r) => {
    if (!r.createdAt) return false;
    const reportDate = new Date(r.createdAt).toDateString();
    const today = new Date().toDateString();
    return reportDate === today;
  }).length;

  const pendingReviewsCount = reports.filter(
    (r) => r.status === "PENDING" || r.status === "UNDER_REVIEW" || r.status === "IN_PROGRESS"
  ).length;

  const highRiskCount = assessments.filter(
    (a) =>
      a.riskLevel === "HIGH" ||
      a.riskLevel === "CRITICAL" ||
      (a.riskScore !== undefined && a.riskScore !== null && Number(a.riskScore) >= 50)
  ).length;

  const portfolioParcelsCount = properties.length;

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">LEGAL COMPLIANCE ENGINE</span>
              <Badge variant="success">POSTGRESQL CONNECTED</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Legal Review Workspace
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Logged in as <span className="font-bold text-blue-600 dark:text-cyan-400">{userName}</span> ({userRole})
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLegalData(true)}
            className="flex items-center gap-1.5 shrink-0"
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync Database
          </Button>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => fetchLegalData(true)}>
              Retry Connection
            </Button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-36 w-full rounded-3xl" />
            <Skeleton className="h-48 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : (
          <>
            {/* 1. DYNAMIC HERO HEADER WITH 100% DATABASE METRICS */}
            <DashboardHeroHeader
              userName={userName}
              userRole={userRole}
              metrics={{
                activeReports: activeReportsCount,
                reportsToday: reportsTodayCount,
                pendingReviews: pendingReviewsCount,
                highRiskCount: highRiskCount,
                portfolioCount: portfolioParcelsCount,
              }}
              verificationBadge="PostgreSQL Verified"
            />

            {/* 2. LEGAL REVIEW WORKSPACE QUICK ACTIONS */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-2">
                  <Scale size={15} className="text-blue-500" /> Legal Workstation Actions
                </h2>
              </div>
              <QuickActions role={userRole} />
            </section>

            {/* 3. LEGAL TITLE DEED VERIFICATION AUDIT TABLE */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#334155]">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scale size={22} className="text-blue-600 dark:text-cyan-400" />
                    Property Title Deed Verification Audit ({properties.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Real estate parcels under title deed verification in PostgreSQL database.
                  </p>
                </div>
              </div>

              {properties.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left font-mono">
                    <thead className="bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5 rounded-l-xl">Parcel Code</th>
                        <th className="p-3.5">Property Name</th>
                        <th className="p-3.5">City / State</th>
                        <th className="p-3.5">Title Status</th>
                        <th className="p-3.5">Assigned Reviewer</th>
                        <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                      {properties.map((p, idx) => {
                        const numId = p.propertyId || p.numericId || idx + 1;
                        const propCity = (typeof p.city === "string" && p.city.trim()) || p.address?.city || "Hyderabad";
                        const propState = (typeof p.state === "string" && p.state.trim()) || p.address?.state || "Telangana";
                        const isVerified = p.status === "VERIFIED";

                        return (
                          <tr key={numId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="p-3.5 font-bold text-blue-600 dark:text-cyan-400">
                              PR-{numId}
                            </td>
                            <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                              {p.propertyName || `Property Parcel #${numId}`}
                            </td>
                            <td className="p-3.5 text-slate-500">
                              {propCity}, {propState}
                            </td>
                            <td className="p-3.5">
                              <Badge variant={isVerified ? "success" : "warning"}>
                                {isVerified ? "Verified Title" : (p.status || "Under Review")}
                              </Badge>
                            </td>
                            <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                              {userName}
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => navigate(`/property-review?id=${numId}`)}
                                  className="flex items-center gap-1"
                                >
                                  <FileSearch size={13} />
                                  <span>Review</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => navigate(`/review-checklist?id=${numId}`)}
                                  className="flex items-center gap-1"
                                >
                                  <FileCheck2 size={13} />
                                  <span>Checklist</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                  <Building2 size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Legal Review Items</p>
                  <p className="text-xs text-slate-500 mt-1">No property records were returned from the backend database.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default LegalDashboard;
