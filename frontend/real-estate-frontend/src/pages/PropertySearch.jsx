import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import PropertySearchWorkspaceHeader from "../components/property/PropertySearchWorkspaceHeader";
import PropertyInspectionDrawer from "../components/property/PropertyInspectionDrawer";
import PropertyTable from "../components/property/PropertyTable";
import EmptyState from "../components/common/EmptyState";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import { Skeleton } from "../components/common/Skeleton";
import {
  LayoutGrid,
  List,
  Building2,
  MapPin,
  Eye,
  ShieldCheck,
  ArrowRight,
  ArrowUpDown,
  AlertCircle,
  RefreshCw,
  Search,
} from "lucide-react";
import { searchProperties } from "../services/propertyService";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";

function PropertySearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialQuery = location.state?.searchQuery || "";

  const [properties, setProperties] = useState([]);
  const [searchAddress, setSearchAddress] = useState(initialQuery);
  const [stateFilter, setStateFilter] = useState("ALL");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [priceFilter, setPriceFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("price-asc");

  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Build backend search criteria object
  const buildCriteria = useCallback(() => {
    const criteria = {
      page: 0,
      size: 50,
    };

    if (searchAddress.trim()) {
      criteria.keyword = searchAddress.trim();
    }

    if (stateFilter !== "ALL") {
      criteria.state = stateFilter;
    }

    if (cityFilter !== "ALL") {
      criteria.city = cityFilter;
    }

    if (typeFilter !== "ALL") {
      criteria.propertyType = typeFilter;
    }

    if (statusFilter !== "ALL") {
      criteria.status = statusFilter;
    }

    if (priceFilter === "UNDER_10CR") {
      criteria.maxMarketValue = 100000000;
    } else if (priceFilter === "10CR_25CR") {
      criteria.minMarketValue = 100000000;
      criteria.maxMarketValue = 250000000;
    } else if (priceFilter === "25CR_50CR") {
      criteria.minMarketValue = 250000000;
      criteria.maxMarketValue = 500000000;
    } else if (priceFilter === "ABOVE_50CR") {
      criteria.minMarketValue = 500000000;
    }

    return criteria;
  }, [searchAddress, stateFilter, cityFilter, typeFilter, statusFilter, priceFilter]);

  // Execute Search against backend Spring Boot API
  const executeSearch = useCallback(() => {
    setLoading(true);
    setError(null);

    const criteria = buildCriteria();

    searchProperties(criteria)
      .then((res) => {
        let items = [];
        if (res && res.data) {
          items = res.data.content || (Array.isArray(res.data) ? res.data : []);
        }

        const formatted = items.map((item, idx) => {
          const rawId = item.propertyId || item.id || idx + 1;
          const numId = typeof rawId === "number" ? rawId : parseInt(rawId.toString().replace(/\D/g, "") || `${idx + 1}`, 10);
          const propCode = item.propertyCode || `PROP-${numId}`;

          let addressStr = "";
          let cityName = "Hyderabad";
          let stateName = "Telangana";

          if (item.address && typeof item.address === "object") {
            const parts = [
              item.address.addressLine1,
              item.address.addressLine2,
              item.address.city,
              item.address.state,
              item.address.postalCode,
            ].filter(Boolean);
            addressStr = parts.join(", ");
            cityName = item.address.city || cityName;
            stateName = item.address.state || stateName;
          } else if (typeof item.address === "string") {
            addressStr = item.address;
          } else {
            addressStr = `${item.propertyName || "Property Parcel"}, ${item.city || "Hyderabad"}`;
          }

          const typeName =
            typeof item.propertyType === "object"
              ? item.propertyType?.typeName
              : item.propertyType || "Residential";

          const mv = Number(item.marketValue || 0);

          return {
            ...item,
            propertyId: numId,
            numericId: numId,
            propertyCode: propCode,
            id: propCode,
            title: item.propertyName || `Property Parcel PR-${numId}`,
            propertyName: item.propertyName || `Property Parcel PR-${numId}`,
            description: item.description || "Real estate property parcel verified in PostgreSQL database.",
            address: addressStr,
            city: item.city || cityName,
            state: item.state || stateName,
            propertyType: typeName,
            type: typeName,
            status: item.status || "UNDER_REVIEW",
            marketValue: mv,
            price: mv >= 10000000 ? `₹ ${(mv / 10000000).toFixed(2)} Cr` : mv > 0 ? `₹ ${(mv / 100000).toFixed(2)} Lakhs` : "Price on Request",
            imageUrl: item.imageUrl || FALLBACK_IMAGE,
          };
        });

        setProperties(formatted);
      })
      .catch((err) => {
        console.error("Property search error:", err);
        setError("Unable to connect to search API. Please verify backend is running on port 8081.");
        setProperties([]);
      })
      .finally(() => setLoading(false));
  }, [buildCriteria]);

  // Debounced search trigger when filter criteria change
  useEffect(() => {
    const handler = setTimeout(() => {
      executeSearch();
    }, 300);
    return () => clearTimeout(handler);
  }, [executeSearch]);

  // Handle Clear Filters
  const handleClearFilters = () => {
    setSearchAddress("");
    setStateFilter("ALL");
    setCityFilter("ALL");
    setPriceFilter("ALL");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setSortBy("price-asc");
  };

  // Client-side sorting for display
  const sortedProperties = useMemo(() => {
    const list = [...properties];
    if (sortBy === "price-asc") {
      return list.sort((a, b) => (a.marketValue || 0) - (b.marketValue || 0));
    }
    if (sortBy === "price-desc") {
      return list.sort((a, b) => (b.marketValue || 0) - (a.marketValue || 0));
    }
    if (sortBy === "name-asc") {
      return list.sort((a, b) => (a.propertyName || "").localeCompare(b.propertyName || ""));
    }
    if (sortBy === "newest") {
      return list.sort((a, b) => (b.propertyId || 0) - (a.propertyId || 0));
    }
    return list;
  }, [properties, sortBy]);

  const handleInspect = (prop) => {
    setSelectedProperty(prop);
    setDrawerOpen(true);
  };

  // Compute appropriate empty state message
  const getEmptyStateMessage = () => {
    if (cityFilter !== "ALL") {
      return `No properties available in ${cityFilter} yet.`;
    }
    if (stateFilter !== "ALL") {
      return `No properties available in ${stateFilter} yet.`;
    }
    if (searchAddress.trim()) {
      return `No properties found matching "${searchAddress}".`;
    }
    return "No properties found matching your filter criteria.";
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16 font-mono">
        {/* FILTER WORKSPACE HEADER */}
        <PropertySearchWorkspaceHeader
          searchAddress={searchAddress}
          setSearchAddress={setSearchAddress}
          stateFilter={stateFilter}
          setStateFilter={setStateFilter}
          cityFilter={cityFilter}
          setCityFilter={setCityFilter}
          priceFilter={priceFilter}
          setPriceFilter={setPriceFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          allProperties={properties}
          onClearFilters={handleClearFilters}
          onSearchSubmit={executeSearch}
        />

        {/* ERROR BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
            <Button variant="danger" size="sm" onClick={executeSearch}>
              Retry
            </Button>
          </div>
        )}

        {/* RESULTS HEADER & VIEW CONTROLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              {loading ? "Searching properties..." : `${sortedProperties.length} properties found`}
            </h2>
            {loading && <RefreshCw size={14} className="animate-spin text-blue-600" />}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Grid View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-cyan-400 shadow-xs"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
                title="Table View"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-72 w-full rounded-3xl" />
            ))}
          </div>
        ) : sortedProperties.length > 0 ? (
          viewMode === "grid" ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProperties.map((prop) => {
                const isVerified = prop.status === "VERIFIED";
                return (
                  <div
                    key={prop.propertyId}
                    className="glass-card rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-6 space-y-4">
                      {/* Top Code & Status */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-blue-600 dark:text-cyan-400 text-xs">
                          {prop.propertyCode}
                        </span>
                        <Badge variant={isVerified ? "success" : prop.status === "PENDING" ? "warning" : "info"}>
                          {prop.status}
                        </Badge>
                      </div>

                      {/* Title & Type */}
                      <div>
                        <div className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          {prop.propertyType}
                        </div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-1">
                          {prop.propertyName}
                        </h3>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-1.5 text-xs text-slate-500 font-sans">
                        <MapPin size={14} className="shrink-0 text-slate-400 mt-0.5" />
                        <span className="line-clamp-2">
                          {prop.address || `${prop.city}, ${prop.state}`}
                        </span>
                      </div>

                      {/* Market Value */}
                      <div className="pt-3 flex items-baseline justify-between border-t border-slate-100 dark:border-[#334155]">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Market Value</span>
                        <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                          {prop.price}
                        </span>
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleInspect(prop)}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-[#334155] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold text-center transition-all cursor-pointer"
                      >
                        Quick Inspect
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/properties/${prop.propertyId}`)}
                        className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold text-center transition-all cursor-pointer shadow-md shadow-blue-500/20 flex items-center justify-center gap-1"
                      >
                        <span>View Details</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLE VIEW */
            <PropertyTable
              properties={sortedProperties}
              onInspect={handleInspect}
              onViewDetails={(prop) => navigate(`/properties/${prop.propertyId || prop.numericId}`)}
            />
          )
        ) : (
          /* EMPTY STATE */
          <div className="glass-card rounded-3xl p-12 text-center bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4 max-w-xl mx-auto">
            <Building2 size={44} className="mx-auto text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {getEmptyStateMessage()}
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Try adjusting your search criteria, selecting a different state or city, or clearing your active filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="mt-2 inline-flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              Clear All Filters
            </Button>
          </div>
        )}

        {/* QUICK INSPECTION DRAWER */}
        <PropertyInspectionDrawer
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          property={selectedProperty}
          onOpenFullDetails={(propId) => navigate(`/properties/${propId}`)}
        />
      </div>
    </MainLayout>
  );
}

export default PropertySearch;