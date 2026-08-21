import React from "react";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  User,
  ShieldCheck,
  Eye,
  Edit3,
  FileDown,
  UserPlus,
  Tag,
} from "lucide-react";
const DEFAULT_PROPERTY_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";

/**
 * Reusable Agent Property Card Component
 * Displays: Image, Property Name, Address, Owner, Market Value, Risk Score, Status
 * Action Buttons: View Details, Edit Property, Generate Report, Assign Client
 */
function AgentPropertyCard({
  property,
  onViewDetails,
  onEditProperty,
  onGenerateReport,
  onAssignClient,
}) {
  if (!property) return null;

  // Safe Property Properties Normalization
  const propertyId = property.id || (property.propertyId ? `PR-${property.propertyId}` : "PR-1001");
  const propertyName = property.title || property.propertyName || property.name || "Commercial Property Parcel";
  
  const propertyAddress =
    property.location ||
    property.address ||
    property.addressLine1 ||
    (property.city ? `${property.city}, ${property.state || ""}` : "Financial District, Hyderabad");

  const ownerName = property.owner || property.clientName || property.client || "Adani Realty Institutional Fund";

  const propertyPrice =
    property.displayPrice ||
    property.marketValueFormatted ||
    (typeof property.marketValue === "number"
      ? `₹ ${(property.marketValue / 10000000).toFixed(2)} Cr`
      : property.price || "₹ 35.00 Cr");

  const riskScore = typeof property.riskScore === "number" ? property.riskScore : 18;
  const propertyStatus = property.status || property.stage || "Active Audit";

  const propertyImage =
    property.image ||
    (Array.isArray(property.images) && property.images.length > 0 ? property.images[0] : null) ||
    DEFAULT_PROPERTY_IMAGE;

  const getRiskBadgeColor = (score) => {
    if (score <= 25)
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800";
    if (score <= 50)
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800";
    return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800";
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="white-card rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* IMAGE & STATUS BADGE */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-[#0F172A]">
          <img
            src={propertyImage}
            alt={propertyName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_PROPERTY_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

          {/* Status Badge Overlay */}
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-mono font-extrabold text-[10px] tracking-wider border border-white/20 uppercase shadow-md">
              {propertyStatus}
            </span>
          </div>

          {/* Risk Score Pill Overlay */}
          <div className="absolute top-3 right-3">
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold border backdrop-blur-md shadow-md flex items-center gap-1 ${getRiskBadgeColor(
                riskScore
              )}`}
            >
              <ShieldCheck size={12} />
              Risk: {riskScore} / 100
            </span>
          </div>

          {/* ID Pill Overlay */}
          <div className="absolute bottom-3 left-3 text-white font-mono text-[11px] font-bold flex items-center gap-1">
            <Building2 size={13} className="text-cyan-400" />
            <span>ID: {propertyId}</span>
          </div>
        </div>

        {/* CONTENT CARD DETAILS */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Property Title & Address */}
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight line-clamp-1">
              {propertyName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-1 line-clamp-1">
              <MapPin size={13} className="text-rose-500 shrink-0" />
              <span>{propertyAddress}</span>
            </p>
          </div>

          {/* Details Grid: Owner & Market Value */}
          <div className="grid grid-cols-2 gap-3 text-xs font-mono p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/80 dark:border-[#334155]">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1">
                <User size={11} className="text-purple-500" /> Assigned Owner
              </span>
              <strong className="text-slate-900 dark:text-white font-extrabold truncate block mt-0.5">
                {ownerName}
              </strong>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block flex items-center gap-1">
                <Tag size={11} className="text-cyan-500" /> Market Value
              </span>
              <strong className="text-blue-600 dark:text-cyan-400 font-extrabold text-sm block mt-0.5">
                {propertyPrice}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* THE 4 REQUIRED ACTION BUTTONS */}
      <div className="p-5 sm:p-6 pt-0 border-t border-slate-100 dark:border-[#334155] grid grid-cols-2 gap-2 text-xs font-mono mt-2">
        {/* 1. View Details */}
        <button
          onClick={() => onViewDetails && onViewDetails(property)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#334155] text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          title="View Details"
        >
          <Eye size={14} className="text-blue-500" />
          <span>View Details</span>
        </button>

        {/* 2. Edit Property */}
        <button
          onClick={() => onEditProperty && onEditProperty(property)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-cyan-300 font-bold transition-colors cursor-pointer"
          title="Edit Property"
        >
          <Edit3 size={14} />
          <span>Edit</span>
        </button>

        {/* 3. Generate Report */}
        <button
          onClick={() => onGenerateReport && onGenerateReport(property)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold transition-colors cursor-pointer"
          title="Generate Report"
        >
          <FileDown size={14} />
          <span>Report</span>
        </button>

        {/* 4. Assign Client */}
        <button
          onClick={() => onAssignClient && onAssignClient(property)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/80 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold transition-colors cursor-pointer"
          title="Assign Client"
        >
          <UserPlus size={14} />
          <span>Assign</span>
        </button>
      </div>
    </motion.div>
  );
}

export default AgentPropertyCard;
