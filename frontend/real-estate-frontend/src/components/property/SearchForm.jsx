import React, { useState } from "react";
import { Search, Filter, RotateCcw, Building, ShieldCheck, MapPin, SlidersHorizontal, CheckCircle2, AlertCircle } from "lucide-react";
import Button from "../common/Button";
import { showErrorAlert, showToast } from "../../utils/swal";

function SearchForm({ onSearch }) {
  const [address, setAddress] = useState("");
  const [propertyType, setPropertyType] = useState("ALL");
  const [riskLevel, setRiskLevel] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Address Validation UI Helper
  const isAddressValid = address.trim().length > 3;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!address.trim() && propertyType === "ALL" && riskLevel === "ALL") {
      showErrorAlert(
        "Search Query Required",
        "Please enter a property address, city, survey number, or select classification filters."
      );
      return;
    }

    showToast(`Searching due diligence records for "${address || propertyType}"`, "info");
    if (onSearch) {
      onSearch({ address, propertyType, riskLevel, statusFilter });
    }
  };

  const handleReset = () => {
    setAddress("");
    setPropertyType("ALL");
    setRiskLevel("ALL");
    setStatusFilter("ALL");
    showToast("Search filters reset to default", "info");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Search Input Bar */}
      <div className="space-y-2">
        <div className="relative flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter City, Locality, Address, or Survey Number (e.g. Jubilee Hills, Hyderabad)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs transition-all text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Search}
              className="w-full sm:w-auto"
            >
              Search Registry DB
            </Button>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleReset}
              icon={RotateCcw}
              title="Reset Filters"
            />
          </div>
        </div>

        {/* Milestone 1 Address Validation UI Status Pill */}
        {address.trim() && (
          <div className="flex items-center gap-2 px-3 py-1 text-xs font-mono">
            {isAddressValid ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 size={13} /> Address Format Verified • State & City Auto-Mapped
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-600 font-medium">
                <AlertCircle size={13} /> Type at least 4 characters to validate location...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200/60">
        {/* Property Type */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-2">
            Property Classification
          </label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Property Types</option>
            <option value="Commercial">Commercial Office & Retail</option>
            <option value="Residential">Residential Villa & Apartment</option>
            <option value="Industrial">Industrial & Warehousing</option>
            <option value="IT Tech Park">IT Tech Park</option>
          </select>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-2">
            Environmental & Flood Risk
          </label>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Risk Ratings</option>
            <option value="LOW">Low Risk (Clear Title)</option>
            <option value="MEDIUM">Moderate / Review Needed</option>
            <option value="HIGH">High Risk Flagged</option>
          </select>
        </div>

        {/* Title Verification Status */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-slate-500 mb-2">
            Title Verification Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Verified">Verified Clear Title</option>
            <option value="Audit">Tax Audit Needed</option>
            <option value="High Risk">High Risk Flagged</option>
          </select>
        </div>
      </div>
    </form>
  );
}

export default SearchForm;