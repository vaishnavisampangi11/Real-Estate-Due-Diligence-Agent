import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  Building2,
  Search,
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  Plus,
  Eye,
  Trash2,
  Edit,
  MapPin,
  ShieldCheck,
  X,
  Check,
  Landmark,
  IndianRupee,
  Layers,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { showErrorAlert, showSuccessAlert, showToast, showConfirmDialog } from "../utils/swal";
import { getAllProperties, createProperty } from "../services/propertyService";

// Helper to format Indian Currency
const formatCurrency = (val) => {
  if (!val && val !== 0) return "Not available";
  const num = Number(val);
  if (isNaN(num)) return "Not available";
  if (num >= 10000000) {
    return `₹ ${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹ ${(num / 100000).toFixed(2)} L`;
  }
  return `₹ ${num.toLocaleString("en-IN")}`;
};

const INITIAL_FORM = {
  propertyName: "",
  propertyCode: "",
  propertyType: "Commercial",
  marketValue: "",
  totalArea: "",
  landArea: "",
  builtYear: "",
  description: "",
  addressLine1: "",
  addressLine2: "",
  city: "Hyderabad",
  district: "Ranga Reddy",
  state: "Telangana",
  postalCode: "500081",
};

function PropertyManagement() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("ALL");
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Modal Controls
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState(INITIAL_FORM);

  const fetchProperties = useCallback(async (isManual = false) => {
    try {
      if (isManual) setSyncing(true);
      else setLoading(true);
      setError(null);

      const res = await getAllProperties(0, 50);
      const items = res?.data?.content || (Array.isArray(res?.data) ? res.data : []);
      setProperties(items);

      const nowStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      setLastSyncTime(nowStr);

      if (isManual) {
        showToast("Property parcels reloaded from PostgreSQL database", "success");
      }
    } catch (err) {
      console.error("Property management API error:", err);
      setError("Unable to load properties from backend server. Please verify Spring Boot connection.");
      setProperties([]);
      if (isManual) {
        showToast("Failed to refresh property database", "error");
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const name = (p.propertyName || p.title || "").toLowerCase();
      const code = (p.propertyCode || `PR-${p.propertyId || ""}`).toLowerCase();
      const city = (p.address?.city || p.city || "").toLowerCase();
      const state = (p.address?.state || p.state || "").toLowerCase();
      const type = (p.propertyType || "").toLowerCase();

      const matchesQuery =
        !q ||
        name.includes(q) ||
        code.includes(q) ||
        city.includes(q) ||
        state.includes(q) ||
        type.includes(q);

      const matchesType =
        selectedType === "ALL" || (p.propertyType && p.propertyType.toUpperCase() === selectedType.toUpperCase());

      return matchesQuery && matchesType;
    });
  }, [properties, searchQuery, selectedType]);

  // Form Field Validation
  const validateForm = () => {
    const errors = {};
    if (!formData.propertyName.trim()) errors.propertyName = "Property Name is required";
    if (!formData.propertyCode.trim()) errors.propertyCode = "Property Code / Parcel ID is required";
    if (!formData.propertyType) errors.propertyType = "Property Type is required";

    if (!formData.marketValue || isNaN(Number(formData.marketValue)) || Number(formData.marketValue) <= 0) {
      errors.marketValue = "Please enter a valid market value greater than 0";
    }

    if (formData.builtYear && (isNaN(Number(formData.builtYear)) || Number(formData.builtYear) < 1800 || Number(formData.builtYear) > 2050)) {
      errors.builtYear = "Built year must be between 1800 and 2050";
    }

    if (!formData.addressLine1.trim()) errors.addressLine1 = "Address Line 1 is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.postalCode.trim() || !/^\d{6}$/.test(formData.postalCode.trim())) {
      errors.postalCode = "Enter a valid 6-digit postal code";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler for Add Property
  const handleAddPropertySubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("Please fill in all required fields accurately", "error");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        propertyName: formData.propertyName.trim(),
        propertyCode: formData.propertyCode.trim().toUpperCase(),
        propertyType: formData.propertyType,
        marketValue: Number(formData.marketValue),
        totalArea: formData.totalArea ? Number(formData.totalArea) : null,
        landArea: formData.landArea ? Number(formData.landArea) : null,
        builtYear: formData.builtYear ? parseInt(formData.builtYear, 10) : null,
        description: formData.description.trim() || null,
        address: {
          addressLine1: formData.addressLine1.trim(),
          addressLine2: formData.addressLine2.trim() || null,
          city: formData.city.trim(),
          district: formData.district.trim() || null,
          state: formData.state.trim(),
          country: "India",
          postalCode: formData.postalCode.trim(),
          addressType: "PHYSICAL",
        },
      };

      const res = await createProperty(payload);
      showSuccessAlert(
        "Property Created Successfully",
        `Parcel '${formData.propertyName}' (${formData.propertyCode}) has been registered in the PostgreSQL database.`
      );

      setShowAddModal(false);
      setFormData(INITIAL_FORM);
      setFormErrors({});
      fetchProperties(false);
    } catch (err) {
      console.error("Failed to create property parcel:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Could not save property to backend database. Please verify inputs and parcel code uniqueness.";
      showErrorAlert("Property Creation Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 pb-16 font-mono text-xs">
        {/* HEADER */}
        <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">ADMINISTRATOR PORTFOLIO CONTROL</span>
              <Badge variant="success">POSTGRESQL LIVE</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Property Parcel Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Manage enterprise real estate parcels queried directly from Spring Boot REST APIs ({properties.length} live records).
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchProperties(true)}
              loading={syncing || loading}
              icon={RefreshCw}
            >
              {syncing ? "Syncing..." : lastSyncTime ? `Sync (${lastSyncTime})` : "Refresh Database"}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFormData(INITIAL_FORM);
                setFormErrors({});
                setShowAddModal(true);
              }}
              icon={Plus}
            >
              Add Property
            </Button>
          </div>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center justify-between gap-4 font-mono">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => fetchProperties(true)}>
              Retry Connection
            </Button>
          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className="glass-card rounded-2xl p-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-8 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by property name, code, city, or state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-xs font-bold text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold cursor-pointer text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Property Types ({properties.length})</option>
                <option value="Commercial">Commercial</option>
                <option value="Residential">Residential</option>
                <option value="Industrial">Industrial</option>
                <option value="Agricultural">Agricultural</option>
                <option value="Mixed Use">Mixed Use</option>
              </select>
            </div>
          </div>
        </div>

        {/* PROPERTY MANAGEMENT TABLE */}
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Parcel ID</th>
                  <th className="p-3.5">Property Name</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">City / State</th>
                  <th className="p-3.5">Market Value</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right rounded-r-xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                {filteredProperties.map((p, idx) => {
                  const numId = p.propertyId || idx + 1;
                  const parcelCode = p.propertyCode || `PR-${numId}`;
                  const cityName = p.address?.city || p.city || "Not available";
                  const stateName = p.address?.state || p.state || "";
                  const typeName = p.propertyType || "Commercial";

                  return (
                    <tr key={numId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-blue-600 dark:text-cyan-400 font-mono">
                        {parcelCode}
                      </td>
                      <td className="p-3.5">
                        <div className="font-extrabold text-slate-900 dark:text-white">
                          {p.propertyName || "Property Parcel"}
                        </div>
                        {p.address?.addressLine1 && (
                          <span className="text-[10px] text-slate-400 block truncate max-w-xs">{p.address.addressLine1}</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <Badge variant="primary">{typeName}</Badge>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300 font-medium">
                        {cityName}{stateName ? `, ${stateName}` : ""}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {formatCurrency(p.marketValue)}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {p.status || "Active Verified"}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/property-details?id=${numId}`)}
                          icon={Eye}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Properties Found"
            message={searchQuery ? `No properties match "${searchQuery}".` : "No property records returned from backend database."}
          />
        )}

        {/* MODAL: ADD PROPERTY PARCEL */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-mono text-xs overflow-y-auto">
              <motion.form
                onSubmit={handleAddPropertySubmit}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-2xl rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-2xl space-y-4 my-8"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 size={18} className="text-blue-500" /> Register Real Estate Parcel
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                  {/* IDENTIFICATION SECTION */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Property Identification</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Property Name *
                        </label>
                        <input
                          type="text"
                          value={formData.propertyName}
                          onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
                          placeholder="e.g. Mindspace Tech Gateway"
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                          required
                        />
                        {formErrors.propertyName && (
                          <span className="text-[10px] text-rose-500 font-bold block mt-1">{formErrors.propertyName}</span>
                        )}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Property / Parcel Code *
                        </label>
                        <input
                          type="text"
                          value={formData.propertyCode}
                          onChange={(e) => setFormData({ ...formData, propertyCode: e.target.value })}
                          placeholder="e.g. PROP-HYD-008"
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold uppercase"
                          required
                        />
                        {formErrors.propertyCode && (
                          <span className="text-[10px] text-rose-500 font-bold block mt-1">{formErrors.propertyCode}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Property Type *
                        </label>
                        <select
                          value={formData.propertyType}
                          onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                        >
                          <option value="Commercial">Commercial</option>
                          <option value="Residential">Residential</option>
                          <option value="Industrial">Industrial</option>
                          <option value="Agricultural">Agricultural</option>
                          <option value="Mixed Use">Mixed Use</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Built Year
                        </label>
                        <input
                          type="number"
                          value={formData.builtYear}
                          onChange={(e) => setFormData({ ...formData, builtYear: e.target.value })}
                          placeholder="e.g. 2023"
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                        />
                        {formErrors.builtYear && (
                          <span className="text-[10px] text-rose-500 font-bold block mt-1">{formErrors.builtYear}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* VALUATION & DIMENSIONS */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">2. Valuation & Dimensions</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Market Value (₹ INR) *
                        </label>
                        <input
                          type="number"
                          value={formData.marketValue}
                          onChange={(e) => setFormData({ ...formData, marketValue: e.target.value })}
                          placeholder="e.g. 65000000"
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                          required
                        />
                        {formErrors.marketValue && (
                          <span className="text-[10px] text-rose-500 font-bold block mt-1">{formErrors.marketValue}</span>
                        )}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Total Built Area (sq.ft)
                        </label>
                        <input
                          type="number"
                          value={formData.totalArea}
                          onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                          placeholder="e.g. 4500"
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Land Area (sq.ft)
                        </label>
                        <input
                          type="number"
                          value={formData.landArea}
                          onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                          placeholder="e.g. 6000"
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* ADDRESS SECTION */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">3. Geographic Parcel Location</span>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={formData.addressLine1}
                        onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                        placeholder="e.g. Plot No. 42, Knowledge City, Hitec City"
                        className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                        required
                      />
                      {formErrors.addressLine1 && (
                        <span className="text-[10px] text-rose-500 font-bold block mt-1">{formErrors.addressLine1}</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="e.g. Hyderabad"
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          placeholder="e.g. Telangana"
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          placeholder="e.g. 500081"
                          className="w-full p-2.5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
                          required
                        />
                        {formErrors.postalCode && (
                          <span className="text-[10px] text-rose-500 font-bold block mt-1">{formErrors.postalCode}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Property Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief overview of parcel titles, building structure, occupancy, or legal status..."
                      rows={3}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-[#334155]">
                  <Button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    variant="secondary"
                    size="sm"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={submitting}
                  >
                    {submitting ? "Creating Property..." : "Save Property to Database"}
                  </Button>
                </div>
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}

export default PropertyManagement;
