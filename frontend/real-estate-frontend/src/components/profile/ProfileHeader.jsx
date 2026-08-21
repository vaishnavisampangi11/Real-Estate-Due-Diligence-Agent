import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Mail,
  Calendar,
  Clock,
  Edit3,
  Camera,
  Phone,
} from "lucide-react";
import { showToast } from "../../utils/swal";

function ProfileHeader({ profileData, onEditClick, avatarUrl, setAvatarUrl }) {
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      showToast("Profile picture updated successfully!", "success");
    }
  };

  const getInitials = (name) => {
    if (!name || name === "User") return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = profileData.name || profileData.fullName || profileData.email?.split("@")[0] || "User";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#334155] shadow-xl relative overflow-hidden bg-white dark:bg-[#1E293B] font-mono text-xs"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 lg:gap-8 relative z-10">
        {/* Avatar Container with Upload */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg shadow-blue-500/25 ring-4 ring-white dark:ring-[#1E293B] overflow-hidden">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{getInitials(displayName)}</span>
            )}
          </div>

          {/* Active Status Indicator Dot */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#1E293B] flex items-center justify-center shadow-md" title="Active Status">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </div>

          {/* Avatar Upload Trigger Overlay */}
          <label className="absolute inset-0 rounded-3xl bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-200">
            <Camera size={18} className="mb-1" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Change</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        {/* User Info & Details */}
        <div className="space-y-2.5 text-center md:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[#F8FAFC] tracking-tight">
              {displayName}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
              <ShieldCheck size={13} className="text-blue-600 dark:text-cyan-400" />
              {profileData.role || "Buyer"}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Active Account
            </span>
          </div>

          {profileData.organization && (
            <p className="text-xs font-semibold text-slate-600 dark:text-[#CBD5E1]">
              <span>{profileData.organization}</span>
            </p>
          )}

          {/* Meta Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-medium text-slate-500 dark:text-[#94A3B8] pt-1">
            {profileData.email && (
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] px-3 py-1 rounded-xl border border-slate-200/60 dark:border-[#334155]">
                <Mail size={13} className="text-blue-600 dark:text-cyan-400" />
                {profileData.email}
              </span>
            )}
            {profileData.phone && (
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] px-3 py-1 rounded-xl border border-slate-200/60 dark:border-[#334155]">
                <Phone size={13} className="text-slate-400" />
                {profileData.phone}
              </span>
            )}
            {profileData.createdAt && (
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] px-3 py-1 rounded-xl border border-slate-200/60 dark:border-[#334155]">
                <Calendar size={13} className="text-indigo-500 dark:text-indigo-400" />
                Member Since: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{new Date(profileData.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short' })}</strong>
              </span>
            )}
            {profileData.lastLogin && (
              <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0F172A] px-3 py-1 rounded-xl border border-slate-200/60 dark:border-[#334155]">
                <Clock size={13} className="text-emerald-500 dark:text-emerald-400" />
                Last Login: <strong className="text-slate-700 dark:text-slate-200 font-semibold">{new Date(profileData.lastLogin).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 pt-2 md:pt-0">
          <button
            onClick={onEditClick}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs tracking-wide shadow-md transition-all cursor-pointer"
          >
            <Edit3 size={14} />
            Edit Profile
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default ProfileHeader;
