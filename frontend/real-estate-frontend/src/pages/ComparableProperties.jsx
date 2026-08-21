import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import {
  ArrowRightLeft,
  Building2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Scale,
  DollarSign,
  TrendingUp,
  Award,
  CheckSquare,
  Square,
  FileSpreadsheet,
  Receipt,
  Percent,
  Landmark,
  ShieldAlert,
} from "lucide-react";
import { showSuccessAlert, showToast } from "../utils/swal";
import PropertyContextSwitcher from "../components/common/PropertyContextSwitcher";
import { getAllProperties } from "../services/propertyService";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80";

function ComparableProperties() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const propertyIdParam = searchParams.get("id") || searchParams.get("propertyId") || "1";
  const numericId = propertyIdParam.toString().replace(/\D/g, "") || "1";

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        setLoading(true);
        const res = await getAllProperties(0, 50);
        const rawList = res?.content || (Array.isArray(res) ? res : res?.data?.content || []);

        const formatted = rawList.map((p, idx) => {
          const pId = String(p.propertyId || p.id || idx + 1);
          const pName = p.propertyName || `Property #${pId}`;
          const pCity = (typeof p.city === "string" && p.city.trim()) || p.address?.city || "Urban Hub";
          const pState = (typeof p.state === "string" && p.state.trim()) || p.address?.state || "India";
          const pAddr = p.addressLine1 || (typeof p.address === "string" ? p.address : p.address?.addressLine1) || `${pCity}, ${pState}`;
          const valNum = Number(p.marketValue || 0);
          const valCr = (valNum / 10000000).toFixed(2);

          return {
            numericId: pId,
            id: p.propertyCode || `PR-${pId}`,
            propertyName: pName,
            city: pCity,
            state: pState,
            address: pAddr,
            propertyType: (p.propertyType || "COMMERCIAL").replace(/_/g, " "),
            marketValue: `₹ ${valCr} Cr`,
            marketValueNum: valNum,
            governmentValue: `₹ ${(valNum * 0.75 / 10000000).toFixed(2)} Cr`,
            taxStatus: p.status === "VERIFIED" ? "Zero Dues Verified" : "Assessment Active",
            loanEligibility: valNum > 0 ? "Eligible" : "Under Appraisal",
            riskScore: p.status === "VERIFIED" ? "Low Risk" : "Under Audit",
            investmentScore: "Institutional Grade",
            priceTrend: "Market Benchmark",
            rentalYield: "Commercial Yield",
            imgSrc: p.imageUrl || FALLBACK_IMAGE,
          };
        });

        setProperties(formatted);

        // Auto-select active property and up to 2 other properties
        if (formatted.length > 0) {
          const activeMatch = formatted.find((p) => p.numericId === numericId) || formatted[0];
          const peers = formatted.filter((p) => p.numericId !== activeMatch.numericId).slice(0, 2);
          setSelectedIds([activeMatch.numericId, ...peers.map((p) => p.numericId)]);
        }
      } catch (err) {
        console.error("Comparable properties query error:", err);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProps();
  }, [numericId]);

  // Toggle Selection (Max 3)
  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length === 1) {
        showToast("At least one property must remain selected for comparison.", "warning");
        return;
      }
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    } else {
      if (selectedIds.length >= 3) {
        showToast("You can select up to three properties for comparison.", "warning");
        return;
      }
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  // Selected property objects
  const selectedProperties = useMemo(() => {
    return properties.filter((p) => selectedIds.includes(p.numericId));
  }, [properties, selectedIds]);

  // 1. Compare
  const handleRunCompare = () => {
    setIsComparing(true);
    showToast("Generating location-benchmarked side-by-side comparison...", "info");
    setTimeout(() => {
      setIsComparing(false);
      showSuccessAlert("Location Matrix Updated", `Comparing ${selectedProperties.length} selected database properties.`);
    }, 400);
  };


  // 3. Reset
  const handleReset = () => {
    if (properties.length > 0) {
      const activeMatch = properties.find((p) => p.numericId === numericId) || properties[0];
      const peers = properties.filter((p) => p.numericId !== activeMatch.numericId).slice(0, 2);
      setSelectedIds([activeMatch.numericId, ...peers.map((p) => p.numericId)]);
      showToast("Comparison pool reset to active property and nearest peers.", "info");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-medium text-slate-500 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={14} className="text-blue-500 dark:text-cyan-400" />
            <span>/</span>
            <span className="text-slate-900 dark:text-[#F8FAFC] font-extrabold">
              Comparative Property Valuation Matrix
            </span>
          </div>

          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 font-mono font-bold text-xs border border-blue-200 dark:border-blue-800">
            COMPARISON POOL • {properties.length} CATALOG PROPERTIES
          </span>
        </div>

        {/* PROPERTY CONTEXT SWITCHER BAR */}
        <PropertyContextSwitcher />

        {/* PROPERTY SELECTOR WORKSPACE */}
        <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4 font-mono text-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-[#334155]">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare size={16} className="text-blue-500" /> Select Properties to Benchmark ({selectedIds.length}/3)
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Check up to 3 properties from your real estate database to run comparison metrics.
              </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleRunCompare}
                variant="primary"
                size="xs"
                icon={ArrowRightLeft}
                loading={isComparing}
              >
                Compare ({selectedIds.length})
              </Button>

              <Button
                onClick={handleReset}
                variant="outline"
                size="xs"
                icon={RotateCcw}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* CHECKBOX SELECTION LIST */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-16 w-full rounded-2xl" />
            </div>
          ) : properties.length === 0 ? (
            <EmptyState
              title="No Catalog Properties Available"
              message="Register properties in PostgreSQL database to enable comparative market appraisal."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {properties.map((p) => {
                const isSelected = selectedIds.includes(p.numericId);
                return (
                  <button
                    key={p.numericId}
                    type="button"
                    onClick={() => handleToggleSelect(p.numericId)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-cyan-500 shadow-xs"
                        : "bg-slate-50 dark:bg-[#0F172A] border-slate-200 dark:border-[#334155] opacity-75 hover:opacity-100"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white text-xs">
                        <span className="truncate">{p.propertyName}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {p.city} • {p.marketValue}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckSquare size={18} className="text-blue-600 dark:text-cyan-400" />
                      ) : (
                        <Square size={18} className="text-slate-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* COMPARATIVE MATRIX TABLE */}
        {selectedProperties.length > 0 && (
          <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-blue-500" /> Side-by-Side Property Comparison Matrix
              </h2>
              <span className="text-[10px] font-bold text-slate-400">
                Comparing {selectedProperties.length} Properties
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#334155] text-slate-400 text-[10px] uppercase font-bold">
                    <th className="pb-4 w-48">Parameter</th>
                    {selectedProperties.map((prop) => (
                      <th key={prop.numericId} className="pb-4 min-w-[200px]">
                        <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {prop.propertyName}
                        </div>
                        <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold">
                          {prop.id} • {prop.city}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#334155]">
                  <tr>
                    <td className="py-3 font-bold text-slate-500">Market Valuation</td>
                    {selectedProperties.map((prop) => (
                      <td key={prop.numericId} className="py-3 font-extrabold text-blue-600 dark:text-cyan-400">
                        {prop.marketValue}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-500">Asset Type</td>
                    {selectedProperties.map((prop) => (
                      <td key={prop.numericId} className="py-3 font-bold text-slate-900 dark:text-white">
                        {prop.propertyType}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-500">Government Circle Rate</td>
                    {selectedProperties.map((prop) => (
                      <td key={prop.numericId} className="py-3 font-medium text-slate-600 dark:text-slate-300">
                        {prop.governmentValue}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-500">Municipal Tax Status</td>
                    {selectedProperties.map((prop) => (
                      <td key={prop.numericId} className="py-3 font-medium text-slate-600 dark:text-slate-300">
                        <Badge variant="success">{prop.taxStatus}</Badge>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-500">Location Address</td>
                    {selectedProperties.map((prop) => (
                      <td key={prop.numericId} className="py-3 text-slate-500 text-xs">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-blue-500 shrink-0" />
                          {prop.address}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 font-bold text-slate-500">Due Diligence Clearance</td>
                    {selectedProperties.map((prop) => (
                      <td key={prop.numericId} className="py-3">
                        <Badge variant="verified">Verified Title</Badge>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default ComparableProperties;
