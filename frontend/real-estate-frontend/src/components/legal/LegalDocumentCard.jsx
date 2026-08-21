import React from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  Calendar,
  ShieldCheck,
  Building2,
  FileCheck,
  Scale,
  Award,
} from "lucide-react";
import Badge from "../common/Badge";

// Icon mapping per Document Type
const DOC_TYPE_ICONS = {
  "Sale Deed": FileText,
  "Title Deed": FileCheck,
  "Registration Certificate": Award,
  "Encumbrance Certificate": ShieldCheck,
  "Property Agreement": Building2,
  "Court Orders": Scale,
};

function LegalDocumentCard({
  doc,
  onView,
  onDownload,
  onVerify,
  onReject,
  onRequestReupload,
}) {
  const IconComponent = DOC_TYPE_ICONS[doc.type || doc.category] || FileText;

  // Status Badge variant
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Verified":
      case "Verified Clear":
        return <Badge variant="success">Verified</Badge>;
      case "Pending Verification":
      case "Pending Review":
        return <Badge variant="warning">Pending Verification</Badge>;
      case "Under Review":
        return <Badge variant="info">Under Review</Badge>;
      case "Rejected":
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-5"
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Header: Icon, Type & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800 shrink-0">
              <IconComponent size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-cyan-400">
                {doc.type || doc.category}
              </span>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
                {doc.name}
              </h3>
            </div>
          </div>

          <div className="shrink-0">
            {renderStatusBadge(doc.verificationStatus || doc.verifiedStatus)}
          </div>
        </div>

        {/* Details Grid: Upload Date & Verified By */}
        <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <Calendar size={11} /> Upload Date
            </span>
            <strong className="text-slate-900 dark:text-white font-extrabold text-xs block mt-1">
              {doc.uploadDate || doc.uploadedDate}
            </strong>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1">
              <User size={11} /> Verified By
            </span>
            <strong className="text-slate-700 dark:text-slate-300 font-extrabold text-xs block mt-1 truncate" title={doc.verifiedBy}>
              {doc.verifiedBy || "Legal Review Pending"}
            </strong>
          </div>
        </div>

        {/* Property Parcel Details */}
        {doc.property && (
          <p className="text-[11px] text-slate-500 font-medium">
            🏢 <strong className="text-slate-700 dark:text-slate-300">{doc.property}</strong>
          </p>
        )}
      </div>

      {/* THE 5 REQUIRED ACTION BUTTONS */}
      <div className="pt-4 border-t border-slate-100 dark:border-[#334155] grid grid-cols-5 gap-1.5 font-mono text-[11px]">
        {/* 1. View */}
        <button
          onClick={() => onView(doc)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer flex flex-col items-center justify-center gap-1"
          title="1. View Document Preview"
        >
          <Eye size={14} />
          <span className="text-[9px]">View</span>
        </button>

        {/* 2. Download */}
        <button
          onClick={() => onDownload(doc)}
          className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 text-blue-700 dark:text-cyan-300 font-bold transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 border border-blue-200 dark:border-blue-800"
          title="2. Download PDF Document"
        >
          <Download size={14} />
          <span className="text-[9px]">Download</span>
        </button>

        {/* 3. Verify */}
        <button
          onClick={() => onVerify(doc)}
          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 border border-emerald-200 dark:border-emerald-800"
          title="3. Approve Document as Verified"
        >
          <CheckCircle2 size={14} />
          <span className="text-[9px]">Verify</span>
        </button>

        {/* 4. Reject */}
        <button
          onClick={() => onReject(doc)}
          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 border border-rose-200 dark:border-rose-800"
          title="4. Reject Document"
        >
          <XCircle size={14} />
          <span className="text-[9px]">Reject</span>
        </button>

        {/* 5. Request Reupload */}
        <button
          onClick={() => onRequestReupload(doc)}
          className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 text-amber-700 dark:text-amber-300 font-bold transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 border border-amber-200 dark:border-amber-800"
          title="5. Request Client Reupload"
        >
          <RotateCcw size={14} />
          <span className="text-[9px]">Reupload</span>
        </button>
      </div>
    </motion.div>
  );
}

export default LegalDocumentCard;
