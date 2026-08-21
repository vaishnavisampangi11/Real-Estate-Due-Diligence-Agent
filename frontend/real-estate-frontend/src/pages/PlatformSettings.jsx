import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import {
  Sliders,
  Building2,
  Globe,
  Clock,
  Mail,
  Bell,
  Sun,
  Moon,
  Save,
  RotateCcw,
  X,
  ShieldCheck,
  Sparkles,
  Server,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { showSuccessAlert, showToast, showConfirmDialog } from "../utils/swal";

// DEFAULT LOCAL SETTINGS STATE
const DEFAULT_SETTINGS = {
  orgName: "Apex Real Estate Due Diligence Portal",
  defaultLanguage: "en-IN",
  timeZone: "Asia/Kolkata",
  smtpServer: "smtp.apex-diligence.in",
  smtpPort: 587,
  senderName: "Apex Due Diligence Security",
  senderEmail: "notifications@apex-diligence.in",
  enableTls: true,
  emailAlerts: true,
  smsAlerts: false,
  pushBadges: true,
  riskEscalationAlerts: true,
  selectedTheme: "dark",
};

function PlatformSettings() {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();

  // Local State Only
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("apex_platform_settings");
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  // Action 1: SAVE
  const handleSaveSettings = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem("apex_platform_settings", JSON.stringify(settings));
    } catch (err) { }

    showSuccessAlert(
      "Platform Settings Saved",
      "All 8 platform settings sections updated successfully in local configuration."
    );
  };

  // Action 2: RESET
  const handleResetSettings = async () => {
    const confirmed = await showConfirmDialog(
      "Reset Platform Settings?",
      "Are you sure you want to revert all settings to enterprise defaults?",
      "Reset Defaults",
      "Cancel"
    );
    if (confirmed) {
      setSettings(DEFAULT_SETTINGS);
      try {
        localStorage.removeItem("apex_platform_settings");
      } catch (err) { }
      showToast("Platform settings restored to defaults", "info");
    }
  };

  // Action 3: CANCEL
  const handleCancelSettings = () => {
    showToast("Edits discarded", "info");
    navigate("/admin/dashboard");
  };

  return (
    <MainLayout>
      <form onSubmit={handleSaveSettings} className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* HEADER BAR */}
        <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-bold mb-2">
              <Sliders size={14} /> Global Enterprise Configurations
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Platform Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure Organization Name, Language, Time Zone, Email Gateway, Notifications, and System Theme.
            </p>
          </div>

          {/* 3 REQUIRED ACTION BUTTONS */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* 1. SAVE BUTTON */}
            <button
              type="submit"
              className="py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Save size={14} />
              <span>Save Settings</span>
            </button>

            {/* 2. RESET BUTTON */}
            <button
              type="button"
              onClick={handleResetSettings}
              className="py-2.5 px-3.5 rounded-2xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Reset Defaults</span>
            </button>

            {/* 3. CANCEL BUTTON */}
            <button
              type="button"
              onClick={handleCancelSettings}
              className="py-2.5 px-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800 font-bold hover:bg-rose-100 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <X size={14} />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        {/* 6 SECTIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SECTION 1: ORGANIZATION NAME */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 size={16} className="text-blue-500" /> 1. Organization Name
              </h2>
              <Badge variant="primary">Brand ID</Badge>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Portal Display Name</label>
              <input
                type="text"
                value={settings.orgName}
                onChange={(e) => setSettings({ ...settings, orgName: e.target.value })}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* SECTION 2: DEFAULT LANGUAGE */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe size={16} className="text-emerald-500" /> 2. Default Language
              </h2>
              <Badge variant="success">Localization</Badge>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">System Language</label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold text-xs cursor-pointer"
              >
                <option value="en-IN">English (India - en-IN)</option>
                <option value="en-US">English (United States - en-US)</option>
                <option value="hi-IN">Hindi (हिन्दी - hi-IN)</option>
                <option value="te-IN">Telugu (తెలుగు - te-IN)</option>
                <option value="ta-IN">Tamil (தமிழ் - ta-IN)</option>
                <option value="mr-IN">Marathi (मराठी - mr-IN)</option>
              </select>
            </div>
          </div>

          {/* SECTION 3: TIME ZONE */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock size={16} className="text-cyan-500" /> 3. Time Zone
              </h2>
              <Badge variant="info">Clock Sync</Badge>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Server & Audit Time Zone</label>
              <select
                value={settings.timeZone}
                onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold text-xs cursor-pointer"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                <option value="UTC">Coordinated Universal Time (UTC)</option>
                <option value="America/New_York">America/New_York (EST -05:00)</option>
                <option value="Europe/London">Europe/London (GMT +00:00)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT +08:00)</option>
              </select>
            </div>
          </div>

          {/* SECTION 4: EMAIL SETTINGS */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Mail size={16} className="text-indigo-500" /> 4. Email Gateway Settings
              </h2>
              <Badge variant="primary">SMTP Config</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">SMTP Host</label>
                <input type="text" value={settings.smtpServer} onChange={(e) => setSettings({ ...settings, smtpServer: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sender Email</label>
                <input type="email" value={settings.senderEmail} onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold" />
              </div>
            </div>
          </div>

          {/* SECTION 5: NOTIFICATION SETTINGS */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell size={16} className="text-teal-500" /> 5. Notification Settings
              </h2>
              <Badge variant="success">Alert Triggers</Badge>
            </div>
            <div className="space-y-2">
              <label className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-between cursor-pointer">
                <span className="font-bold text-slate-900 dark:text-white">Email Digest Alerts</span>
                <input type="checkbox" checked={settings.emailAlerts} onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })} className="rounded cursor-pointer" />
              </label>
              <label className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-between cursor-pointer">
                <span className="font-bold text-slate-900 dark:text-white">Risk Escalation Alerts</span>
                <input type="checkbox" checked={settings.riskEscalationAlerts} onChange={(e) => setSettings({ ...settings, riskEscalationAlerts: e.target.checked })} className="rounded cursor-pointer" />
              </label>
            </div>
          </div>

          {/* SECTION 6: THEME */}
          <div className="white-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-3">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                {isDark ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-500" />} 6. System Theme
              </h2>
              <Badge variant="info">{isDark ? "Dark Active" : "Light Active"}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold cursor-pointer hover:border-blue-500 transition-all flex items-center justify-center gap-2"
              >
                {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-blue-600" />}
                <span>Toggle Theme ({isDark ? "Light Mode" : "Dark Mode"})</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </MainLayout>
  );
}

export default PlatformSettings;
