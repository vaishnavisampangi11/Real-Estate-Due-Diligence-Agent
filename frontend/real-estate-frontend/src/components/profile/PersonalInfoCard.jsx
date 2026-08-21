import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit2,
  Save,
  X,
  Building2,
  Briefcase,
} from "lucide-react";
import Button from "../common/Button";
import { showToast, showSuccessAlert } from "../../utils/swal";

function PersonalInfoCard({ profileData, setProfileData }) {
  const [isEditing, setIsEditing] = useState(false);

  const getInitialFormData = () => ({
    firstName: profileData.firstName || (profileData.name && profileData.name !== "User" ? profileData.name.split(" ")[0] : ""),
    lastName: profileData.lastName || (profileData.name && profileData.name !== "User" ? profileData.name.split(" ").slice(1).join(" ") : ""),
    email: profileData.email || "",
    role: profileData.role || "Buyer",
    phone: profileData.phone || "",
    company: profileData.organization || "",
    address: profileData.address || "",
    city: profileData.city || "",
    state: profileData.state || "",
    country: profileData.country || "India",
  });

  const [formData, setFormData] = useState(getInitialFormData);

  useEffect(() => {
    setFormData(getInitialFormData());
  }, [profileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim() || profileData.name || "User";

    const updated = {
      ...profileData,
      name: fullName,
      fullName: fullName,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email,
      role: formData.role,
      organization: formData.company,
      company: formData.company,
      phone: formData.phone,
      phoneNumber: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
    };

    setProfileData(updated);

    // Persist to localStorage and dispatch event for global sync
    try {
      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("user_profile_updated"));
    } catch (err) {}

    setIsEditing(false);
    showSuccessAlert("Profile Updated", "Your profile details have been saved.");
  };

  const handleCancel = () => {
    setFormData(getInitialFormData());
    setIsEditing(false);
    showToast("Edits cancelled", "info");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#334155] shadow-lg relative bg-white dark:bg-[#1E293B] font-mono text-xs"
      id="personal-info-card"
    >
      {/* Card Header & Controls */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/80 dark:border-[#334155]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-blue-800/40">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-[#F8FAFC]">
              Personal Information & Dossier
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-[#94A3B8]">
              Manage your personal identity, contact channels, and organizational credentials.
            </p>
          </div>
        </div>

        <div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold transition-all cursor-pointer"
            >
              <Edit2 size={13} />
              <span>Edit Details</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 text-slate-600 dark:text-slate-400 font-bold transition-all cursor-pointer"
              >
                <X size={13} />
                <span>Cancel</span>
              </button>
              <Button
                type="submit"
                form="personal-info-form"
                variant="primary"
                size="xs"
                icon={Save}
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <form id="personal-info-form" onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* First Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              First Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
              />
            ) : (
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50/60 dark:bg-[#0F172A]/50 border border-slate-200/50 dark:border-[#334155]/50">
                {formData.firstName || "—"}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Last Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
              />
            ) : (
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50/60 dark:bg-[#0F172A]/50 border border-slate-200/50 dark:border-[#334155]/50">
                {formData.lastName || "—"}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Email Address
            </label>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50/60 dark:bg-[#0F172A]/50 border border-slate-200/50 dark:border-[#334155]/50 flex items-center gap-1.5">
              <Mail size={13} className="text-slate-400" />
              {formData.email || "—"}
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
              />
            ) : (
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50/60 dark:bg-[#0F172A]/50 border border-slate-200/50 dark:border-[#334155]/50 flex items-center gap-1.5">
                <Phone size={13} className="text-slate-400" />
                {formData.phone || "—"}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Assigned Platform Role
            </label>
            <p className="text-xs font-bold text-blue-600 dark:text-cyan-400 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-800/50">
              {formData.role}
            </p>
          </div>

          {/* Company / Organization */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Company / Organization
            </label>
            {isEditing ? (
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter organization name"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
              />
            ) : (
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50/60 dark:bg-[#0F172A]/50 border border-slate-200/50 dark:border-[#334155]/50 flex items-center gap-1.5">
                <Building2 size={13} className="text-slate-400" />
                {formData.company || "—"}
              </p>
            )}
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              City
            </label>
            {isEditing ? (
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
              />
            ) : (
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50/60 dark:bg-[#0F172A]/50 border border-slate-200/50 dark:border-[#334155]/50 flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" />
                {formData.city || "—"}
              </p>
            )}
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              State
            </label>
            {isEditing ? (
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold"
              />
            ) : (
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50/60 dark:bg-[#0F172A]/50 border border-slate-200/50 dark:border-[#334155]/50">
                {formData.state || "—"}
              </p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
              Country
            </label>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 p-2.5 rounded-xl bg-slate-50/60 dark:bg-[#0F172A]/50 border border-slate-200/50 dark:border-[#334155]/50 flex items-center gap-1.5">
              <Globe size={13} className="text-slate-400" />
              {formData.country || "India"}
            </p>
          </div>
        </div>
      </form>
    </motion.div>
  );
}

export default PersonalInfoCard;
