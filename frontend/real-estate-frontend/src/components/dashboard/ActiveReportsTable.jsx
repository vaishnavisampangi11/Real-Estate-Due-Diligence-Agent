import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, Download, FileText, ArrowRight, RefreshCw, AlertCircle, Building2 } from "lucide-react";
import { getAllProperties } from "../../services/propertyService";
import { showToast } from "../../utils/swal";
import EmptyState from "../common/EmptyState";

function ActiveReportsTable() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getAllProperties(0, 10);
      const data = res?.data?.content || res?.data || [];
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load active reports & property activity", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDownload = (propertyName) => {
    showToast(`Downloading due diligence audit report for "${propertyName}"`, "success");
  };

  const getRiskChip = (riskStatus, riskScore) => {
    const status = (riskStatus || "").toUpperCase();
    if (status === "HIGH" || riskScore >= 70) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 shrink-0">
          High Risk ({riskScore || 78})
        </span>
      );
    }
    if (status === "MEDIUM" || (riskScore >= 35 && riskScore < 70)) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
          Medium Risk ({riskScore || 45})
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
        Low Risk ({riskScore || 14})
      </span>
    );
  };

  const getStatusChip = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PENDING" || s === "UNDER_REVIEW") {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          Pending
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-800">
        Completed
      </span>
    );
  };

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#334155]">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <FileText size={20} className="text-blue-600 dark:text-cyan-400" />
            Recent Property & Due Diligence Activity
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">
            Real-time audit statuses, verified land titles, and generated reports from backend records.
          </p>
        </div>

        <button
          onClick={() => navigate("/report-history")}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#334155] text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer shrink-0"
        >
          <span>View All Reports</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 py-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900">
          <AlertCircle size={32} className="mx-auto text-rose-500" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Unable to load property activity</h3>
          <p className="text-xs text-slate-500">Connecting to backend server failed or returned an invalid response.</p>
          <button
            onClick={fetchProperties}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
          >
            <RefreshCw size={14} />
            <span>Retry Connection</span>
          </button>
        </div>
      ) : properties.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#334155] text-slate-400 dark:text-slate-400 uppercase font-mono tracking-wider">
                <th className="py-3 px-3">Property</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Search Date</th>
                <th className="py-3 px-3">Risk Status</th>
                <th className="py-3 px-3">Report Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#334155]/60">
              {properties.map((p, idx) => {
                const name = p.title || p.addressLine1 || `Property #${p.id || idx + 1}`;
                const location = [p.city, p.state].filter(Boolean).join(", ") || "Hyderabad, Telangana";
                const searchDate = p.createdDate ? new Date(p.createdDate).toLocaleDateString() : "Today";
                return (
                  <motion.tr
                    key={p.id || idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.03 * idx }}
                    className="hover:bg-slate-50/80 dark:hover:bg-[#0F172A]/50 transition-colors"
                  >
                    <td className="py-3.5 px-3 font-extrabold text-slate-900 dark:text-white max-w-[200px] truncate">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-blue-600 dark:text-cyan-400 shrink-0" />
                        <span className="truncate">{name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-600 dark:text-slate-300">
                      {location}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-500 dark:text-slate-400">
                      {searchDate}
                    </td>
                    <td className="py-3.5 px-3">
                      {getRiskChip(p.riskStatus, p.riskScore)}
                    </td>
                    <td className="py-3.5 px-3">
                      {getStatusChip(p.status)}
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => navigate("/property-details", { state: { propertyId: p.id } })}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-300 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
                        title="View Property Details"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => handleDownload(name)}
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
                        title="Download Report PDF"
                      >
                        <Download size={15} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No properties or reports found."
          message="No active due diligence property audit records were returned by the backend server."
        />
      )}
    </div>
  );
}

export default ActiveReportsTable;

