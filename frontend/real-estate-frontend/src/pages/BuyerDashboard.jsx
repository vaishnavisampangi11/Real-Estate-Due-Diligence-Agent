import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import QuickActions from "../components/dashboard/QuickActions";
import ReportGeneratorModal from "../components/dashboard/ReportGeneratorModal";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  Building2,
  Search,
  Eye,
  FileText,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Sparkles,
  MapPin,
  Scale,
  Bell,
  CheckCircle2,
  Calendar,
  Layers,
} from "lucide-react";
import { getAllProperties, getMyReports } from "../services/propertyService";
import { getMyNotifications } from "../services/notificationService";

function BuyerDashboard() {
  const navigate = useNavigate();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedModalPropId, setSelectedModalPropId] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser.userId || storedUser.id || "2";
  const firstName = storedUser.firstName || storedUser.name?.split(" ")[0] || "Buyer";
  const userRole = "Buyer";

  const [properties, setProperties] = useState([]);
  const [myReports, setMyReports] = useState([]);
  const [myNotifications, setMyNotifications] = useState([]);
  const [watchlistIds, setWatchlistIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const fetchBuyerData = async () => {
    setLoading(true);
    setError(null);

    // Read user-scoped watchlist from localStorage
    try {
      const savedWatchlist = JSON.parse(localStorage.getItem(`buyer_watchlist_${userId}`) || "[]");
      setWatchlistIds(Array.isArray(savedWatchlist) ? savedWatchlist : []);
    } catch (e) {
      setWatchlistIds([]);
    }

    try {
      const [propsRes, reportsRes, notifsRes] = await Promise.allSettled([
        getAllProperties(0, 50),
        getMyReports(),
        getMyNotifications(),
      ]);

      if (propsRes.status === "fulfilled" && propsRes.value?.data) {
        const items = propsRes.value.data.content || (Array.isArray(propsRes.value.data) ? propsRes.value.data : []);
        setProperties(items);
      } else {
        setProperties([]);
      }

      if (reportsRes.status === "fulfilled" && reportsRes.value?.data) {
        const repItems = Array.isArray(reportsRes.value.data) ? reportsRes.value.data : [];
        setMyReports(repItems);
      } else {
        setMyReports([]);
      }

      if (notifsRes.status === "fulfilled" && notifsRes.value?.data) {
        const notifItems = Array.isArray(notifsRes.value.data) ? notifsRes.value.data : [];
        setMyNotifications(notifItems);
      } else {
        setMyNotifications([]);
      }
    } catch (err) {
      console.warn("Buyer dashboard fetch error:", err);
      setError("Unable to connect to backend server. Please verify Spring Boot is running on port 8081.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerData();
  }, [userId]);

  // Watchlisted properties derived from global catalog
  const watchlistedProperties = properties.filter((p) => {
    const pId = (p.propertyId || p.numericId || p.id || "").toString();
    return watchlistIds.includes(pId);
  });

  const handleOpenReport = (propId) => {
    setSelectedModalPropId(propId || "");
    setReportModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 font-mono max-w-7xl mx-auto">
        {/* BUYER HEADER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  REAL ESTATE BUYER WORKSPACE
                </span>
                <Badge variant="success">POSTGRESQL LIVE</Badge>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {getGreeting()}, <span className="text-blue-600 dark:text-cyan-400">{firstName}</span>
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-sans font-medium">
                Evaluate properties with confidence.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchBuyerData}
                className="flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Sync Data
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate("/property-search")}
                className="flex items-center gap-1.5 shadow-md shadow-blue-500/20"
              >
                <Search size={14} />
                Explore Properties
              </Button>
            </div>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
            <Button variant="danger" size="sm" onClick={fetchBuyerData}>
              Retry
            </Button>
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-28 w-full rounded-3xl" />
            <Skeleton className="h-64 w-full rounded-3xl" />
          </div>
        ) : (
          <>
            {/* BUYER KPI METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-3xl p-6 border shadow-xs bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] border-l-4 border-l-blue-500 font-mono text-xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Property Catalog
                  </span>
                  <div className="p-2.5 rounded-2xl border bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 border-blue-200 dark:border-blue-800">
                    <Building2 size={18} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  {properties.length}
                </h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-3">
                  Shared real estate parcels
                </span>
              </div>

              <div className="rounded-3xl p-6 border shadow-xs bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] border-l-4 border-l-purple-500 font-mono text-xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    My Watchlist
                  </span>
                  <div className="p-2.5 rounded-2xl border bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800">
                    <Eye size={18} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  {watchlistIds.length}
                </h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-3">
                  Properties saved by you
                </span>
              </div>

              <div className="rounded-3xl p-6 border shadow-xs bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] border-l-4 border-l-emerald-500 font-mono text-xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    My Due Diligence Reports
                  </span>
                  <div className="p-2.5 rounded-2xl border bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800">
                    <FileText size={18} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                  {myReports.length}
                </h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-3">
                  Audits generated by you
                </span>
              </div>

              <div className="rounded-3xl p-6 border shadow-xs bg-white dark:bg-[#1E293B] border-slate-200 dark:border-[#334155] border-l-4 border-l-amber-500 font-mono text-xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Due Diligence Engine
                  </span>
                  <div className="p-2.5 rounded-2xl border bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  READY
                </h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold block mt-3">
                  30-Yr Title & Compliance Check
                </span>
              </div>
            </div>

            {/* BUYER WORKSPACE QUICK ACTIONS */}
            <QuickActions role="Buyer" />

            {/* SHARED PROPERTY CATALOG HIGHLIGHTS */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#334155]">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-bold mb-2">
                    <Building2 size={14} /> Shared Real Estate Inventory
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    Verified Properties For Purchase ({properties.length})
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Real estate parcels queried directly from PostgreSQL database.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/property-search")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
                >
                  <span>Explore Full Catalog ({properties.length})</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.slice(0, 6).map((prop, idx) => {
                    const pId = prop.propertyId || prop.numericId || idx + 1;
                    const mv = Number(prop.marketValue || 0);
                    const formattedPrice =
                      mv >= 10000000
                        ? `₹ ${(mv / 10000000).toFixed(2)} Cr`
                        : mv > 0
                        ? `₹ ${(mv / 100000).toFixed(2)} Lakhs`
                        : "Price on Request";

                    return (
                      <div
                        key={pId}
                        className="rounded-2xl border border-slate-200 dark:border-[#334155] bg-slate-50/50 dark:bg-[#0F172A] p-5 space-y-4 hover:border-blue-500 transition-all group flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-blue-600 dark:text-cyan-400 text-xs">
                              {prop.propertyCode || `PR-${pId}`}
                            </span>
                            <Badge variant={prop.status === "VERIFIED" ? "success" : "info"}>
                              {prop.status || "ACTIVE"}
                            </Badge>
                          </div>

                          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                            {prop.propertyName || `Property Parcel PR-${pId}`}
                          </h3>

                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <MapPin size={13} className="shrink-0 text-slate-400" />
                            <span className="truncate">
                              {prop.address?.city ? `${prop.address.city}, ${prop.address.state || ""}` : "Hyderabad, Telangana"}
                            </span>
                          </div>

                          <div className="pt-2 flex items-baseline justify-between border-t border-slate-200/60 dark:border-[#1E293B]">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Market Value</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                              {formattedPrice}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/properties/${pId}`)}
                            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-[#334155] hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold text-center transition-all cursor-pointer"
                          >
                            Inspect
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenReport(pId)}
                            className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold text-center transition-all cursor-pointer shadow-xs"
                          >
                            Due Diligence
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No Properties Found"
                  message="No active real estate parcels found in PostgreSQL database."
                />
              )}
            </div>

            {/* 2-COLUMN SECTION: MY REPORTS + RECENT NOTIFICATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* MY REPORTS */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <FileText size={18} className="text-emerald-500" /> My Diligence Reports
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Private reports generated by your account.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/report-history")}
                    className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    View All ({myReports.length})
                  </button>
                </div>

                {myReports.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-[#334155]">
                    {myReports.slice(0, 4).map((r, idx) => {
                      const pId = r.propertyId || r.property?.propertyId || idx + 1;
                      return (
                        <div key={r.reportId || idx} className="py-3 flex items-center justify-between gap-4">
                          <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white block">
                              {r.reportName || `Due Diligence Audit - PR-${pId}`}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {r.generatedAt ? new Date(r.generatedAt).toLocaleDateString() : "Recently Generated"} • {r.status || "FINAL"}
                            </span>
                          </div>
                          <button
                            onClick={() => navigate("/report-history")}
                            className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                          >
                            View
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <FileText size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      My reports will appear here after you generate a due-diligence report.
                    </p>
                    <button
                      onClick={() => handleOpenReport("")}
                      className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                    >
                      + Generate New Report
                    </button>
                  </div>
                )}
              </div>

              {/* RECENT NOTIFICATIONS */}
              <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <Bell size={18} className="text-blue-500" /> Notifications
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Updates on your searches, assessments, and reports.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/notifications")}
                    className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                  >
                    View All ({myNotifications.length})
                  </button>
                </div>

                {myNotifications.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-[#334155]">
                    {myNotifications.slice(0, 4).map((n, idx) => (
                      <div key={n.notificationId || idx} className="py-3 flex items-start gap-3">
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5">
                          <Bell size={13} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                            {n.title || "Notification"}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 line-clamp-2">
                            {n.message || ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center space-y-2">
                    <Bell size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                      No notifications.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* REPORT GENERATION MODAL */}
        <ReportGeneratorModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          initialPropertyId={selectedModalPropId}
        />
      </div>
    </MainLayout>
  );
}

export default BuyerDashboard;
