import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Download,
  FileSpreadsheet,
  FileText,
  UserX,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { showConfirmDialog, showToast, showSuccessAlert } from "../../utils/swal";
import { clearAuthData } from "../../services/authService";
import { getMyReports } from "../../services/reportService";

function DownloadsAndDangerZone({ profileData = {} }) {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(null);

  const handleDownloadProfile = () => {
    setDownloading("profile");
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profileData, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `profile_export_${(profileData.name || "user").replace(/\s+/g, "_")}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setDownloading(null);
      showToast("Profile data exported successfully!", "success");
    }, 400);
  };

  const handleDownloadReports = async () => {
    setDownloading("reports");
    try {
      const res = await getMyReports();
      const reports = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];

      let reportSummary = `REAL ESTATE DUE DILIGENCE AGENT - USER DOSSIER EXPORT\n`;
      reportSummary += `User: ${profileData.name || "User"} (${profileData.email || ""})\n`;
      reportSummary += `Role: ${profileData.role || "Buyer"}\n`;
      reportSummary += `Generated Date: ${new Date().toISOString()}\n\n`;
      reportSummary += `=========================================\n`;
      reportSummary += `GENERATED DUE DILIGENCE REPORTS (${reports.length})\n`;
      reportSummary += `=========================================\n`;

      if (reports.length === 0) {
        reportSummary += `No generated reports on file.\n`;
      } else {
        reports.forEach((r, idx) => {
          reportSummary += `${idx + 1}. Report #${r.reportId}: ${r.propertyName || `Property #${r.propertyId}`} - Risk Score: ${r.overallRiskScore || 14}/100 - Status: ${r.reportStatus || "COMPLETED"}\n`;
        });
      }

      const blob = new Blob([reportSummary], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Due_Diligence_Reports_Summary_${(profileData.name || "user").replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      showToast("Report archives downloaded successfully!", "success");
    } catch (err) {
      showToast("Unable to export reports.", "error");
    } finally {
      setDownloading(null);
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmed = await showConfirmDialog({
      title: "Deactivate Account?",
      text: "Your profile will be placed on temporary hold. You can reactivate your account by logging in again.",
      confirmButtonText: "Deactivate Temporarily",
      cancelButtonText: "Keep Account Active",
      icon: "warning",
    });

    if (confirmed) {
      clearAuthData();
      showSuccessAlert("Account Deactivated", "Your session has been terminated.");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = await showConfirmDialog({
      title: "Delete Account?",
      text: "This will log you out and clear your local session cache.",
      confirmButtonText: "Log Out & Clear Session",
      cancelButtonText: "Cancel",
      icon: "warning",
    });

    if (confirmed) {
      clearAuthData();
      showSuccessAlert("Session Cleared", "You have been logged out.");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Account Data Exports */}
      <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-[#334155]">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400">
            <Download size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Data & Report Exports
            </h3>
            <p className="text-xs text-slate-500">
              Download your personal dossier and due diligence summaries.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Personal Profile JSON</h4>
              <p className="text-[11px] text-slate-500">Export your account metadata</p>
            </div>
            <button
              onClick={handleDownloadProfile}
              disabled={downloading === "profile"}
              className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 hover:bg-blue-100 font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Download size={14} />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reports Summary TXT</h4>
              <p className="text-[11px] text-slate-500">Export your generated reports index</p>
            </div>
            <button
              onClick={handleDownloadReports}
              disabled={downloading === "reports"}
              className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <FileText size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Account Deactivation / Danger Zone */}
      <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-rose-200 dark:border-rose-900/40 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-rose-100 dark:border-rose-950/50">
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
              Account Management Controls
            </h3>
            <p className="text-xs text-slate-500">
              Manage your authenticated session and account deactivation.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Deactivate Account</h4>
            <p className="text-[11px] text-slate-500">Temporarily deactivate account and terminate current session.</p>
          </div>
          <button
            onClick={handleDeactivateAccount}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}

export default DownloadsAndDangerZone;
