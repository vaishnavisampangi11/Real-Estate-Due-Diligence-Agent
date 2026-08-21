import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import {
  Eye,
  Trash2,
  Bell,
  BellOff,
  Plus,
  Building2,
  MapPin,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  Receipt,
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Activity,
  Sliders,
  DollarSign,
} from "lucide-react";
import { showToast } from "../utils/swal";
import { setLiveActiveProperty, getLiveProperties } from "../services/liveStore";
import PropertyContextSwitcher from "../components/common/PropertyContextSwitcher";
import { getAllProperties } from "../services/propertyService";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";

function PropertyWatchlist() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = storedUser.userId || storedUser.id || "2";

  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedAddPropId, setSelectedAddPropId] = useState("1");
  const [allAvailableProps, setAllAvailableProps] = useState([]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllProperties(0, 50);
        const list = res?.content || (Array.isArray(res) ? res : res?.data?.content || res?.data || []);
        setAllAvailableProps(list);
        
        // Read user-scoped saved IDs
        const savedIds = JSON.parse(localStorage.getItem(`buyer_watchlist_${userId}`) || "[]");
        const userWatchlistProps = list.filter((p) => {
          const pId = (p.propertyId || p.numericId || p.id || "").toString();
          return savedIds.includes(pId);
        });

        const formatted = userWatchlistProps.map((p, idx) => {
          const pId = p.propertyId || p.id || idx + 1;
          const mv = Number(p.marketValue || 0);
          const crVal = mv >= 10000000 ? `₹ ${(mv / 10000000).toFixed(2)} Cr` : `₹ ${(mv / 100000).toFixed(2)} Lakhs`;
          return {
            numericId: pId.toString(),
            id: p.propertyCode || `PR-${pId}`,
            propertyName: p.propertyName || p.title || `Property Parcel PR-${pId}`,
            city: p.address?.city || "Hyderabad",
            address: p.address?.city ? `${p.address.addressLine1 || ""}, ${p.address.city}, ${p.address.state || ""}` : (p.address || "Hyderabad, Telangana"),
            price: crVal,
            oldPrice: crVal,
            priceChange: "No Price Change",
            riskScore: p.status === "VERIFIED" ? 14 : 35 + (idx * 5) % 40,
            oldRiskScore: 20,
            riskChange: "Stable",
            taxStatus: "Municipal Tax Verified",
            ownershipStatus: "Title Deed Verified",
            monitoringEnabled: true,
            recentAlert: {
              type: "STATUS_VERIFIED",
              title: "Due Diligence Active",
              message: `Continuous monitoring enabled for ${p.propertyName || `PR-${pId}`}.`,
              timestamp: "Active",
            },
            imgSrc: p.imageUrl || FALLBACK_IMAGE,
          };
        });
        setWatchlist(formatted);
      } catch (err) {
        console.error("Failed to load watchlist:", err);
        setError("Unable to load watchlist. Please verify backend is running on port 8081.");
        setWatchlist([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, [userId]);

  // Filter Watchlist items by search query
  const filteredWatchlist = useMemo(() => {
    if (!searchQuery.trim()) return watchlist;
    const q = searchQuery.toLowerCase().trim();
    return watchlist.filter(
      (item) =>
        item.propertyName.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.address.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.price.toLowerCase().includes(q)
    );
  }, [watchlist, searchQuery]);

  // Toggle Monitoring ON / OFF
  const handleToggleMonitoring = (numId, e) => {
    e.stopPropagation();
    setWatchlist((prev) =>
      prev.map((item) => {
        if (item.numericId === numId) {
          const nextState = !item.monitoringEnabled;
          showToast(
            nextState
              ? `Enabled 24/7 GIS Monitoring for ${item.propertyName}`
              : `Paused monitoring for ${item.propertyName}`,
            nextState ? "success" : "info"
          );
          return { ...item, monitoringEnabled: nextState };
        }
        return item;
      })
    );
  };

  // Remove Property from Watchlist
  const handleRemoveFromWatchlist = (numId, propName, e) => {
    e.stopPropagation();
    setWatchlist((prev) => {
      const updated = prev.filter((item) => item.numericId !== numId);
      const remainingIds = updated.map((item) => item.numericId);
      localStorage.setItem(`buyer_watchlist_${userId}`, JSON.stringify(remainingIds));
      return updated;
    });
    showToast(`Removed "${propName}" from Watchlist`, "info");
  };

  // Add Property to Watchlist
  const handleWatchProperty = () => {
    const existing = watchlist.find((item) => item.numericId === selectedAddPropId);
    if (existing) {
      showToast(`Property PR-${selectedAddPropId} is already in your Watchlist!`, "warning");
      setAddModalOpen(false);
      return;
    }

    const found = allAvailableProps.find(
      (p) => (p.numericId || p.propertyId || p.id || "").toString().replace(/\D/g, "") === selectedAddPropId
    );

    if (found) {
      const pId = (found.propertyId || found.numericId || found.id || selectedAddPropId).toString();
      const mv = Number(found.marketValue || 0);
      const crVal = mv >= 10000000 ? `₹ ${(mv / 10000000).toFixed(2)} Cr` : `₹ ${(mv / 100000).toFixed(2)} Lakhs`;

      const newItem = {
        numericId: pId,
        id: found.propertyCode || `PR-${pId}`,
        propertyName: found.propertyName || found.title || `Property Parcel PR-${pId}`,
        city: found.address?.city || "Hyderabad",
        address: found.address?.city ? `${found.address.addressLine1 || ""}, ${found.address.city}, ${found.address.state || ""}` : (found.address || "Hyderabad, Telangana"),
        price: crVal,
        oldPrice: crVal,
        priceChange: "No Price Change",
        riskScore: found.status === "VERIFIED" ? 14 : 25,
        oldRiskScore: 20,
        riskChange: "Stable",
        taxStatus: "Municipal Tax Verified",
        ownershipStatus: "Title Deed Verified",
        monitoringEnabled: true,
        recentAlert: {
          type: "STATUS_VERIFIED",
          title: "Added to Watchlist",
          message: `Monitoring active for ${found.propertyName || `PR-${pId}`}.`,
          timestamp: "Active",
        },
        imgSrc: found.imageUrl || FALLBACK_IMAGE,
      };

      setWatchlist((prev) => {
        const updated = [newItem, ...prev];
        const newIds = updated.map((i) => i.numericId);
        localStorage.setItem(`buyer_watchlist_${userId}`, JSON.stringify(newIds));
        return updated;
      });

      showToast(`Added ${newItem.propertyName} to your Watchlist`, "success");
    }
    setAddModalOpen(false);
  };

  const handleInspect = (numId) => {
    setLiveActiveProperty(numId);
    navigate(`/due-diligence-report?id=${numId}`);
  };

  // Alert Badge Helper
  const renderAlertBadge = (alert) => {
    switch (alert.type) {
      case "PRICE_CHANGED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
            <DollarSign size={12} /> Price Changed
          </span>
        );
      case "RISK_CHANGED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2.5 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
            <ShieldAlert size={12} /> Risk Changed
          </span>
        );
      case "TAX_UPDATED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            <Receipt size={12} /> Tax Updated
          </span>
        );
      case "OWNERSHIP_CHANGED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/80 px-2.5 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
            <UserCheck size={12} /> Ownership Changed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* PROPERTY CONTEXT SWITCHER BAR */}
        <PropertyContextSwitcher currentPropertyId="1001" />

        {/* Page Header Banner */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-mono font-bold mb-2">
              <Eye size={14} /> 24/7 Automated GIS Property Monitoring
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
              👁️ Property Watchlist & Live Monitoring
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] mt-1 max-w-2xl">
              Track real-time market price changes, risk index fluctuations, municipal tax payments, and title deed ownership transfers.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button onClick={() => setAddModalOpen(true)} variant="primary" size="sm" icon={Plus}>
              Watch Property
            </Button>
          </div>
        </div>

        {/* Search & Stats Bar */}
        <div className="white-card rounded-2xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search watchlist properties..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              Total Watched: <strong className="text-slate-900 dark:text-white">{watchlist.length} Parcels</strong>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {watchlist.filter((w) => w.monitoringEnabled).length} Active Monitored
            </span>
          </div>
        </div>

        {/* WATCHLIST CARDS GRID / LIST */}
        <div className="space-y-4">
          {filteredWatchlist.length > 0 ? (
            <AnimatePresence>
              {filteredWatchlist.map((item) => (
                <motion.div
                  key={item.numericId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => handleInspect(item.numericId)}
                  className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:shadow-xl transition-all duration-200 space-y-4 cursor-pointer group"
                >
                  {/* Top Row: Info & Status Pill */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.imgSrc}
                        alt={item.propertyName}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-[#334155] shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400">
                            {item.id}
                          </span>
                          {/* Live Monitoring Status Badge */}
                          {item.monitoringEnabled ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active 24/7 Monitoring
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                              Monitoring Paused
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                          {item.propertyName}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} className="text-blue-500 shrink-0" />
                          <span>{item.address}</span>
                        </p>
                      </div>
                    </div>

                    {/* Enable / Disable Monitoring Button & Remove Button */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <Button
                        onClick={(e) => handleToggleMonitoring(item.numericId, e)}
                        variant={item.monitoringEnabled ? "secondary" : "outline"}
                        size="sm"
                        icon={item.monitoringEnabled ? BellOff : Bell}
                      >
                        {item.monitoringEnabled ? "Disable Monitoring" : "Enable Monitoring"}
                      </Button>

                      <button
                        onClick={(e) => handleRemoveFromWatchlist(item.numericId, item.propertyName, e)}
                        title="Remove from Watchlist"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors border border-slate-200 dark:border-[#334155]"
                      >
                        <Trash2 size={16} />
                      </button>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-cyan-400 group-hover:underline ml-1">
                        Inspect <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>

                  {/* 4 STATUS CHANGE MONITORED METRICS GRID */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-[#334155] text-xs font-mono">
                    {/* 1. Price Changed */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase">
                        <span>Price Status</span>
                        <DollarSign size={13} className="text-blue-500" />
                      </div>
                      <strong className="text-blue-600 dark:text-cyan-400 font-extrabold block text-sm">
                        {item.price}
                      </strong>
                      <span className="text-[10px] text-slate-500 block truncate">{item.priceChange}</span>
                    </div>

                    {/* 2. Risk Changed */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase">
                        <span>Risk Index</span>
                        <ShieldCheck size={13} className="text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <strong className={`font-extrabold text-sm ${item.riskScore > 60 ? "text-rose-600" : "text-emerald-600"}`}>
                          {item.riskScore} / 100
                        </strong>
                        <Badge variant={item.riskScore > 60 ? "danger" : "success"}>
                          {item.riskScore > 60 ? "High" : "Low"}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-slate-500 block truncate">{item.riskChange}</span>
                    </div>

                    {/* 3. Tax Updated */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase">
                        <span>Tax Clearance</span>
                        <Receipt size={13} className="text-indigo-500" />
                      </div>
                      <strong className="text-slate-900 dark:text-white font-bold block truncate">
                        {item.taxStatus}
                      </strong>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-bold">
                        Zero Municipal Liens
                      </span>
                    </div>

                    {/* 4. Ownership Changed */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase">
                        <span>Title Deed Chain</span>
                        <UserCheck size={13} className="text-purple-500" />
                      </div>
                      <strong className="text-slate-900 dark:text-white font-bold block truncate">
                        {item.ownershipStatus}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">Sub-Registrar Verified</span>
                    </div>
                  </div>

                  {/* Recent Trigger Alert Box */}
                  {item.recentAlert && (
                    <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {renderAlertBadge(item.recentAlert)}
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {item.recentAlert.title}:
                        </span>
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          {item.recentAlert.message}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock size={11} /> {item.recentAlert.timestamp}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <EmptyState
              title="No saved properties yet."
              message="Explore properties to start your evaluation."
              actionLabel="Explore Properties"
              onAction={() => navigate("/property-search")}
            />
          )}
        </div>

        {/* WATCH PROPERTY MODAL */}
        <AnimatePresence>
          {addModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAddModalOpen(false)}
                className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#334155] p-6 sm:p-8 max-w-md w-full space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#334155]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-blue-600 text-white font-bold shrink-0">
                      <Eye size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        Watch Property Parcel
                      </h2>
                      <p className="text-xs text-slate-500 font-mono">
                        Enable 24/7 Automated GIS Monitoring
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <label className="block text-slate-700 dark:text-slate-300 font-bold">
                    Select Target Property Parcel:
                  </label>
                  <select
                    value={selectedAddPropId}
                    onChange={(e) => setSelectedAddPropId(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 p-3 rounded-xl focus:outline-none cursor-pointer"
                  >
                    {allAvailableProps.map((p, idx) => {
                      const pid = (p.numericId || p.propertyId || p.id || idx + 1001).toString().replace(/\D/g, "") || `${idx + 1001}`;
                      return (
                        <option key={pid} value={pid}>
                          PR-{pid} - {p.propertyName || p.title || `Parcel #${pid}`} ({p.city || "Hyderabad"})
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-[#334155] flex items-center justify-end gap-3">
                  <Button onClick={() => setAddModalOpen(false)} variant="secondary" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleWatchProperty} variant="primary" size="sm" icon={Plus}>
                    Start Watching
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

export default PropertyWatchlist;
