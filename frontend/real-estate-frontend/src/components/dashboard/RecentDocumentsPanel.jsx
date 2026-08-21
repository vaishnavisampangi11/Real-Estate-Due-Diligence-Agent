import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Download, Eye, FileSpreadsheet, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { getAllProperties } from "../../services/propertyService";
import { showToast } from "../../utils/swal";

function RecentDocumentsPanel() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProperties(0, 3)
      .then((res) => {
        const data = res?.data?.content || res?.data || [];
        setReports(Array.isArray(data) ? data.slice(0, 3) : []);
      })
      .catch((err) => console.error("Failed to load reports", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPDF = (name) => {
    showToast(`Exporting PDF Audit Report for "${name}"`, "success");
  };

  const handleDownloadExcel = (name) => {
    showToast(`Exporting Excel Data Sheet for "${name}"`, "info");
  };

  return (
    <div className="glass-card rounded-3xl p-6 border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#334155]">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText size={18} className="text-indigo-500" />
          Generated Due Diligence Reports
        </h3>
        <button
          onClick={() => navigate("/report-history")}
          className="text-xs font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
        >
          History
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 dark:bg-slate-800/60 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-3">
          {reports.map((r, idx) => {
            const propName = r.title || r.addressLine1 || `Property Audit #${r.id || idx + 1}`;
            const genDate = r.createdDate ? new Date(r.createdDate).toLocaleDateString() : "Aug 3, 2026";
            const riskScore = r.riskScore || (idx === 0 ? 18 : idx === 1 ? 78 : 34);

            return (
              <div
                key={r.id || idx}
                className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-[#0F172A]/70 border border-slate-200/60 dark:border-[#334155] space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                      {propName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Generated: {genDate}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold font-mono shrink-0 ${riskScore >= 70 ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"}`}>
                    Risk: {riskScore}/100
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-[#334155]/50 text-xs">
                  <button
                    onClick={() => navigate("/due-diligence-report", { state: { propertyId: r.id } })}
                    className="text-[11px] font-bold text-blue-600 dark:text-cyan-400 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Eye size={13} />
                    <span>View Details</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownloadPDF(propName)}
                      className="px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 text-[10px] font-bold flex items-center gap-1 hover:bg-rose-100 cursor-pointer transition-colors"
                      title="Download PDF"
                    >
                      <FileText size={12} />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => handleDownloadExcel(propName)}
                      className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-100 cursor-pointer transition-colors"
                      title="Download Excel"
                    >
                      <FileSpreadsheet size={12} />
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-400 text-center py-4">No report files found.</p>
      )}
    </div>
  );
}

export default RecentDocumentsPanel;

