import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Search,
  Plus,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Eye,
  Home,
  ChevronRight,
  Filter,
  ArrowUpDown,
  MapPin,
  ShieldCheck,
  FileText,
  DollarSign,
  Layers,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  Scale,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import { searchProperties, getAllProperties } from "../services/propertyService";

function AgentProperties() {
  const navigate = useNavigate();

  // State Management
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("VALUE_DESC");

  // Fetch real properties from the exact same PostgreSQL backend service as Buyer Property Search
  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const criteria = {
        page: 0,
        size: 100,
      };

      if (searchQuery.trim()) {
        criteria.keyword = searchQuery.trim();
      }
      if (cityFilter !== "ALL") {
        criteria.city = cityFilter;
      }
      if (stateFilter !== "ALL") {
        criteria.state = stateFilter;
      }
      if (typeFilter !== "ALL") {
        criteria.propertyType = typeFilter;
      }
      if (statusFilter !== "ALL") {
        criteria.status = statusFilter;
      }

      const res = await searchProperties(criteria);
      const dataPayload = res?.data || res;

      let list = [];
      if (dataPayload && dataPayload.content) {
        list = dataPayload.content;
      } else if (Array.isArray(dataPayload)) {
        list = dataPayload;
      } else if (res?.content) {
        list = res.content;
      }

      // If search query was specific and returned 0, try fallback getAllProperties
      if (list.length === 0 && !searchQuery.trim() && cityFilter === "ALL" && typeFilter === "ALL") {
        const allRes = await getAllProperties(0, 100);
        const allPayload = allRes?.data || allRes;
        list = allPayload?.content || (Array.isArray(allPayload) ? allPayload : allRes?.content || []);
      }

      setProperties(list);
      setLastSyncTime(new Date());
    } catch (err) {
      console.error("Properties fetching error:", err);
      setError("Unable to load properties from backend database. Please ensure Spring Boot is running.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, cityFilter, stateFilter, typeFilter, statusFilter]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Dynamic filter options derived from actual database records
  const filterOptions = useMemo(() => {
    const cities = Array.from(
      new Set(
        properties
          .map((p) => (typeof p.city === "string" && p.city.trim()) || p.address?.city || "")
          .filter(Boolean)
      )
    ).sort();

    const states = Array.from(
      new Set(
        properties
          .map((p) => (typeof p.state === "string" && p.state.trim()) || p.address?.state || "")
          .filter(Boolean)
      )
    ).sort();

    const types = Array.from(
      new Set(
        properties
          .map((p) => (typeof p.propertyType === "object" ? p.propertyType?.typeName : p.propertyType || ""))
          .filter(Boolean)
      )
    ).sort();

    return { cities, states, types };
  }, [properties]);

  // Computed Real Metrics
  const metrics = useMemo(() => {
    const total = properties.length;
    let sumValue = 0;
    let verifiedCount = 0;

    properties.forEach((p) => {
      sumValue += Number(p.marketValue || 0);
      if (p.status === "VERIFIED") {
        verifiedCount += 1;
      }
    });

    const totalValCr = (sumValue / 10000000).toFixed(2);
    const verifiedRate = total > 0 ? ((verifiedCount / total) * 100).toFixed(1) : "0.0";

    return { total, totalValCr, verifiedCount, verifiedRate };
  }, [properties]);

  // Sort properties
  const sortedProperties = useMemo(() => {
    const list = [...properties];
    if (sortBy === "VALUE_DESC") {
      list.sort((a, b) => Number(b.marketValue || 0) - Number(a.marketValue || 0));
    } else if (sortBy === "VALUE_ASC") {
      list.sort((a, b) => Number(a.marketValue || 0) - Number(b.marketValue || 0));
    } else if (sortBy === "NAME_ASC") {
      list.sort((a, b) => (a.propertyName || "").localeCompare(b.propertyName || ""));
    }
    return list;
  }, [properties, sortBy]);

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 max-w-7xl mx-auto font-mono text-xs">
        {/* BREADCRUMB HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-500 dark:text-[#CBD5E1]">
          <nav className="flex items-center gap-2">
            <Link to="/agent/dashboard" className="hover:text-blue-600 dark:text-cyan-400 transition-colors flex items-center gap-1.5">
              <Home size={14} /> Agent Workspace
            </Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              My Properties
            </span>
          </nav>

          <div className="flex items-center gap-3">
            {lastSyncTime && (
              <span className="text-[11px] text-slate-400">
                Synced {lastSyncTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <Button
              variant="outline"
              size="xs"
              onClick={fetchProperties}
              loading={loading}
              icon={RefreshCw}
            >
              Sync
            </Button>
          </div>
        </div>

        {/* ERROR STATE BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <div>
                <p className="font-bold">Unable to load properties</p>
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
              </div>
            </div>
            <Button variant="danger" size="xs" onClick={fetchProperties}>
              Retry
            </Button>
          </div>
        )}

        {/* HERO BANNER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
              <Building2 size={13} /> Real Estate Property Portfolio
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              🏢 My Properties
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-[#CBD5E1] max-w-2xl">
              Real-time property registry synchronized directly with PostgreSQL due diligence data.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => navigate("/property-search")}
              variant="outline"
              size="sm"
              icon={Search}
            >
              Buyer Search View
            </Button>
          </div>
        </div>

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Total Parcels</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-slate-900 dark:text-white">
                {loading ? "..." : metrics.total}
              </strong>
              <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
                <Building2 size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Title Verified</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {loading ? "..." : `${metrics.verifiedCount} / ${metrics.total}`}
              </strong>
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Portfolio Valuation</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                ₹ {loading ? "..." : metrics.totalValCr} Cr
              </strong>
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <DollarSign size={18} />
              </div>
            </div>
          </div>

          <div className="white-card rounded-3xl p-5 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
            <span className="text-slate-400 uppercase text-[10px] font-bold block">Clear Title Rate</span>
            <div className="flex items-center justify-between mt-2">
              <strong className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {loading ? "..." : `${metrics.verifiedRate}%`}
              </strong>
              <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <ShieldCheck size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="white-card rounded-3xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties by name, code, city, state, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-slate-100 pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* City Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <MapPin size={12} className="text-slate-400" />
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Cities</option>
                {filterOptions.cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <Filter size={12} className="text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL">All Types</option>
                {filterOptions.types.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] px-3 py-1.5 rounded-xl">
              <ArrowUpDown size={12} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:outline-none cursor-pointer text-xs"
              >
                <option value="VALUE_DESC">Value: High to Low</option>
                <option value="VALUE_ASC">Value: Low to High</option>
                <option value="NAME_ASC">Name (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* LOADING SKELETON */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-56 w-full rounded-3xl" />
            <Skeleton className="h-56 w-full rounded-3xl" />
            <Skeleton className="h-56 w-full rounded-3xl" />
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && properties.length === 0 && (
          <div className="py-12">
            <EmptyState
              title="No Properties Available"
              message="No properties matched your query or exist in the registry."
              actionLabel="Reset Search Filters"
              onAction={() => {
                setSearchQuery("");
                setCityFilter("ALL");
                setStateFilter("ALL");
                setTypeFilter("ALL");
                setStatusFilter("ALL");
              }}
            />
          </div>
        )}

        {/* PROPERTY CARDS GRID */}
        {!loading && !error && sortedProperties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProperties.map((prop) => {
              const pId = prop.propertyId || prop.id;
              const pCode = prop.propertyCode || `PR-${pId}`;
              const valCr = (Number(prop.marketValue || 0) / 10000000).toFixed(2);
              const pCity = prop.city || (typeof prop.address === "object" ? prop.address?.city : "") || "Urban Region";
              const pState = prop.state || (typeof prop.address === "object" ? prop.address?.state : "") || "India";
              const pAddr =
                prop.addressLine1 ||
                (typeof prop.address === "string" ? prop.address : prop.address?.addressLine1) ||
                `${pCity}, ${pState}`;

              return (
                <div
                  key={pId}
                  className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4 flex flex-col justify-between hover:border-blue-400 dark:hover:border-cyan-500 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-cyan-400">
                        {pCode}
                      </span>
                      <Badge variant={prop.status === "VERIFIED" ? "success" : "warning"}>
                        {prop.status || "IN REVIEW"}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {prop.propertyName || `Property #${pId}`}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 line-clamp-1">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span>{pAddr}, {pCity}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/60 dark:border-[#334155]">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Market Value</span>
                        <strong className="text-blue-600 dark:text-cyan-400 font-extrabold text-xs block mt-0.5">
                          ₹ {valCr} Cr
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Asset Type</span>
                        <span className="text-slate-700 dark:text-slate-300 font-bold text-xs block mt-0.5 truncate">
                          {(prop.propertyType || "Residential").replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#334155] flex items-center justify-between gap-2">
                    <Button
                      onClick={() => navigate(`/property-details?id=${pId}`)}
                      variant="outline"
                      size="xs"
                      icon={Eye}
                    >
                      View Details
                    </Button>

                    <Button
                      onClick={() => navigate(`/agent/requests`)}
                      variant="primary"
                      size="xs"
                      icon={FileSpreadsheet}
                    >
                      DD Requests
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default AgentProperties;
