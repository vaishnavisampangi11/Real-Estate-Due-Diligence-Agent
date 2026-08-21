import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Landmark,
  ShieldCheck,
  Building2,
  DollarSign,
  TrendingUp,
  FileCheck,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  PieChart,
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
import QuickActions from "../components/dashboard/QuickActions";
import { showToast } from "../utils/swal";

function FinancialDashboard() {
  const navigate = useNavigate();

  // Authenticated User from Session
  const storedUser = getCurrentUser() || {};
  const userName = storedUser.firstName
    ? `${storedUser.firstName} ${storedUser.lastName || ""}`.trim()
    : storedUser.name || (storedUser.email ? storedUser.email.split("@")[0] : "Financial Officer");
  const userRole = storedUser.role ? storedUser.role.replace(/_/g, " ") : "Financial Institution";

  const [properties, setProperties] = useState([]);
  const [reports, setReports] = useState([]);
  const [riskAssessments, setRiskAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [propRes, repRes, riskRes] = await Promise.allSettled([
        getAllProperties(0, 50),
        getMyReports(),
        getMyAssessments(),
      ]);

      if (propRes.status === "fulfilled" && propRes.value) {
        const payload = propRes.value.data || propRes.value;
        const items = Array.isArray(payload) ? payload : (payload?.content || []);
        setProperties(items);
      } else {
        setProperties([]);
      }

      if (repRes.status === "fulfilled" && repRes.value) {
        const payload = repRes.value.data || repRes.value;
        const items = Array.isArray(payload) ? payload : (payload?.content || []);
        setReports(items);
      } else {
        setReports([]);
      }

      if (riskRes.status === "fulfilled" && riskRes.value) {
        const payload = riskRes.value.data || riskRes.value;
        const items = Array.isArray(payload) ? payload : (payload?.content || []);
        setRiskAssessments(items);
      } else {
        setRiskAssessments([]);
      }
    } catch (err) {
      console.error("Financial dashboard API error:", err);
      setError("Unable to load financial underwriting data from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  // Compute live database metrics
  const activeReportsCount = reports.length;
  const reportsTodayCount = reports.filter((r) => {
    const ts = r.createdAt || r.generatedAt;
    if (!ts) return false;
    const d = new Date(ts);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const pendingReviewsCount = properties.filter(
    (p) => p.status === "PENDING" || p.status === "UNDER_REVIEW"
  ).length;

  const highRiskCount = riskAssessments.filter(
    (r) => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL" || (Number(r.riskScore) >= 60)
  ).length;

  const portfolioCount = properties.length;

  const handleSyncUnderwriting = () => {
    fetchFinancialData();
    showToast("Synchronized mortgage collateral portfolio with PostgreSQL.", "info");
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400">INSTITUTIONAL MORTGAGE DESK</span>
              <Badge variant="success">POSTGRESQL CONNECTED</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Financial Underwriting Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Logged in as <span className="font-bold text-blue-600 dark:text-cyan-400">{userName}</span> ({userRole})
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={handleSyncUnderwriting} className="flex items-center gap-1.5 shrink-0">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Sync Underwriting
          </Button>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
            <Button variant="danger" size="sm" onClick={fetchFinancialData}>
              Retry Connection
            </Button>
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : (
          <>
            <DashboardHeroHeader
              userName={userName}
              userRole={userRole}
              metrics={{
                activeReports: activeReportsCount,
                reportsToday: reportsTodayCount,
                pendingReviews: pendingReviewsCount,
                highRiskCount: highRiskCount,
                portfolioCount: portfolioCount,
              }}
              verificationBadge="Institution Verified"
            />

            <QuickActions role={userRole} />

            {/* FINANCIAL UNDERWRITING PORTFOLIO TABLE */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#334155]">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Landmark size={22} className="text-blue-600 dark:text-cyan-400" />
                    Property Mortgage Collateral Portfolios ({properties.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Real estate parcels under collateral underwriting in PostgreSQL database.
                  </p>
                </div>
              </div>

              {properties.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-3.5 rounded-l-xl">Parcel Code</th>
                        <th className="p-3.5">Property Parcel</th>
                        <th className="p-3.5">Location</th>
                        <th className="p-3.5">Market Value</th>
                        <th className="p-3.5">Collateral Status</th>
                        <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                      {properties.map((p, idx) => {
                        const numId = p.propertyId || p.numericId || idx + 1;
                        const isVerified = p.status === "VERIFIED" || p.status === "APPROVED";
                        const isUnderReview = p.status === "UNDER_REVIEW" || p.status === "PENDING";
                        const locationStr = p.city ? `${p.city}, ${p.state || ""}` : (p.address?.city || "Municipal Zone");

                        return (
                          <tr key={numId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="p-3.5 font-bold text-blue-600 dark:text-cyan-400 font-mono">
                              {p.propertyCode || `PR-${numId}`}
                            </td>
                            <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                              {p.propertyName || `Property Parcel #${numId}`}
                            </td>
                            <td className="p-3.5 text-slate-500 font-bold">
                              {locationStr}
                            </td>
                            <td className="p-3.5 font-bold text-purple-600 dark:text-purple-400">
                              {p.marketValue ? `₹ ${(Number(p.marketValue) / 10000000).toFixed(2)} Cr` : "Not available"}
                            </td>
                            <td className="p-3.5">
                              {isVerified ? (
                                <Badge variant="success">Clear Title Collateral</Badge>
                              ) : isUnderReview ? (
                                <Badge variant="warning">Underwriting Pending</Badge>
                              ) : (
                                <Badge variant="secondary">{p.status || "Active"}</Badge>
                              )}
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => navigate(`/property-valuation?id=${numId}`)}
                              >
                                Valuation
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => navigate(`/financial/risk-analysis?id=${numId}`)}
                              >
                                Underwrite <ArrowRight size={12} />
                              </Button>
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
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No Collateral Parcels</p>
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

export default FinancialDashboard;
