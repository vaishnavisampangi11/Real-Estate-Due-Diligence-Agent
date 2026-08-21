import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Sun,
  Moon,
  Monitor,
  Globe,
  Sliders,
  Mail,
  ShieldAlert,
  FileText,
  Calendar,
  Clock,
  LayoutDashboard,
  Check,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { showToast } from "../../utils/swal";

function SettingsAndPreferences({ filterSection = null }) {
  const { theme, setTheme, isDark } = useTheme();

  // Notification Toggles State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    propertyAlerts: true,
    reportReadyNotifications: true,
    securityAlerts: true,
    weeklySummary: false,
  });

  // Preferences State
  const [preferences, setPreferences] = useState({
    language: "en-US",
    timezone: "America/Chicago", // UTC-6
    dateFormat: "MM/DD/YYYY",
    dashboardPreference: "overview",
  });

  const handleToggleNotification = (key, label) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast(`${label} ${updated[key] ? "Enabled" : "Disabled"}`, "info");
      return updated;
    });
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: value,
    }));
    showToast("Account preference updated", "success");
  };

  const handleThemeSelect = (selectedTheme) => {
    if (selectedTheme === "system") {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
      showToast("Theme set to System Default", "info");
    } else {
      setTheme(selectedTheme);
      showToast(`Switched to ${selectedTheme === "dark" ? "Dark" : "Light"} Mode`, "info");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="space-y-8"
      id="settings-preferences-section"
    >
      {/* 8. Notification Settings */}
      {(!filterSection || filterSection === "notifications") && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-200/80 dark:border-[#334155]">
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
              <Bell size={22} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
                Notification Settings
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">
                Choose how and when you receive automated alerts, email summaries, and security notifications.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              {
                key: "emailNotifications",
                label: "Email Notifications",
                desc: "Receive critical updates and account notifications via email.",
                icon: Mail,
              },
              {
                key: "propertyAlerts",
                label: "Property Alerts",
                desc: "Instant notifications when bookmarked property risk scores or tax statuses change.",
                icon: Bell,
              },
              {
                key: "reportReadyNotifications",
                label: "Report Ready Notifications",
                desc: "Alerts when asynchronous due diligence and environmental reports finish generating.",
                icon: FileText,
              },
              {
                key: "securityAlerts",
                label: "Security Alerts",
                desc: "Immediate notifications for unrecognized logins or credential modifications.",
                icon: ShieldAlert,
              },
              {
                key: "weeklySummary",
                label: "Weekly Summary",
                desc: "Weekly digest of your search activity, saved properties, and risk assessments.",
                icon: Calendar,
              },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.key}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-[#0F172A]/70 border border-slate-200/60 dark:border-[#334155] flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-blue-600 dark:text-cyan-400 border border-slate-200/60 dark:border-[#334155]">
                      <IconComp size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.label}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={notifications[item.key]}
                      onChange={() => handleToggleNotification(item.key, item.label)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-blue-800 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 9. Appearance Settings */}
      {(!filterSection || filterSection === "preferences") && (
        <>
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-200/80 dark:border-[#334155]">
          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40">
            <Sun size={22} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
              Appearance & Theme Settings
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">
              Customize visual theme styling to suit your desktop environment.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Mode Card */}
          <div
            onClick={() => handleThemeSelect("light")}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-3 ${
              theme === "light"
                ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                : "border-slate-200 dark:border-[#334155] hover:border-blue-400 bg-white dark:bg-[#0F172A]"
            }`}
          >
            <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
              <Sun size={26} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Light Mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                Clean, high-contrast white aesthetic for bright workplaces.
              </p>
            </div>
            {theme === "light" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-cyan-400">
                <Check size={14} /> Active
              </span>
            )}
          </div>

          {/* Dark Mode Card */}
          <div
            onClick={() => handleThemeSelect("dark")}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-3 ${
              theme === "dark"
                ? "border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/20"
                : "border-slate-200 dark:border-[#334155] hover:border-blue-400 bg-white dark:bg-[#0F172A]"
            }`}
          >
            <div className="p-3 rounded-2xl bg-slate-800 text-cyan-400">
              <Moon size={26} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Dark Mode
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                Sleek slate-900 dark mode engineered for low eye strain.
              </p>
            </div>
            {theme === "dark" && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-cyan-400">
                <Check size={14} /> Active
              </span>
            )}
          </div>

          {/* System Theme Card */}
          <div
            onClick={() => handleThemeSelect("system")}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-3 border-slate-200 dark:border-[#334155] hover:border-blue-400 bg-white dark:bg-[#0F172A]`}
          >
            <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Monitor size={26} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                System Theme
              </h3>
              <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-1">
                Automatically sync with operating system light/dark settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 10. Account Preferences */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-6">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-200/80 dark:border-[#334155]">
          <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800/40">
            <Sliders size={22} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-[#F8FAFC]">
              Account Preferences & Localization
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">
              Configure language, timezone, date formatting, and default dashboard view.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Language */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase mb-2 flex items-center gap-1.5">
              <Globe size={14} className="text-blue-500" />
              Language
            </label>
            <select
              name="language"
              value={preferences.language}
              onChange={handlePreferenceChange}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en-US">English (United States)</option>
              <option value="es-ES">Español (Spanish)</option>
              <option value="fr-FR">Français (French)</option>
              <option value="de-DE">Deutsch (German)</option>
              <option value="ja-JP">日本語 (Japanese)</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase mb-2 flex items-center gap-1.5">
              <Clock size={14} className="text-indigo-500" />
              Timezone
            </label>
            <select
              name="timezone"
              value={preferences.timezone}
              onChange={handlePreferenceChange}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="America/Chicago">Central Time (US & Canada) UTC-6</option>
              <option value="America/New_York">Eastern Time (US & Canada) UTC-5</option>
              <option value="America/Denver">Mountain Time (US & Canada) UTC-7</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada) UTC-8</option>
              <option value="UTC">Coordinated Universal Time (UTC)</option>
              <option value="Asia/Kolkata">India Standard Time (IST) UTC+5:30</option>
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase mb-2 flex items-center gap-1.5">
              <Calendar size={14} className="text-emerald-500" />
              Date Format
            </label>
            <select
              name="dateFormat"
              value={preferences.dateFormat}
              onChange={handlePreferenceChange}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/01/2026)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 01/08/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
            </select>
          </div>

          {/* Dashboard Preference */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-500 dark:text-[#94A3B8] uppercase mb-2 flex items-center gap-1.5">
              <LayoutDashboard size={14} className="text-cyan-500" />
              Dashboard Preference
            </label>
            <select
              name="dashboardPreference"
              value={preferences.dashboardPreference}
              onChange={handlePreferenceChange}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="overview">Default Overview Dashboard</option>
              <option value="risk">Risk Analytics Focus</option>
              <option value="search">Property Search & Intelligence</option>
              <option value="reports">Report History & Archival</option>
            </select>
          </div>
        </div>
      </div>
      </>
      )}
    </motion.div>
  );
}

export default SettingsAndPreferences;
