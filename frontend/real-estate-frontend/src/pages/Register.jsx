import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  ArrowRight,
  Briefcase,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { registerUser } from "../services/authService";
import { showErrorAlert, showSuccessAlert, showToast } from "../utils/swal";
import { useTheme } from "../context/ThemeContext";

function Register() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "+91 ",
    password: "",
    confirmPassword: "",
    role: "Buyer",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    if (!value.startsWith("+91 ")) {
      value = "+91 " + value.replace(/^\+91\s*/, "");
    }
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      showErrorAlert("First Name Required", "Please enter your first name.");
      return;
    }

    if (!formData.lastName.trim()) {
      showErrorAlert("Last Name Required", "Please enter your last name.");
      return;
    }

    if (!formData.email || !formData.email.includes("@")) {
      showErrorAlert(
        "Valid Email Required",
        "Please enter a valid email address."
      );
      return;
    }

    const rawDigits = formData.phone.replace(/\D/g, "");
    if (rawDigits.length < 12) {
      showErrorAlert(
        "Invalid Phone Number",
        "Please enter a valid 10-digit mobile number with +91 country code."
      );
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      showErrorAlert(
        "Weak Password",
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showErrorAlert(
        "Password Mismatch",
        "Passwords do not match. Please recheck."
      );
      return;
    }

    if (!formData.role) {
      showErrorAlert("Role Required", "Please select your account role.");
      return;
    }

    setLoading(true);

    // Extract exactly 10 digits to align with backend @Pattern(regexp = "^[0-9]{10}$")
    const sanitizedPhone = formData.phone.replace(/\D/g, "").slice(-10);

    try {
      await registerUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: sanitizedPhone,
        password: formData.password,
        role: formData.role,
      });

      await showSuccessAlert(
        "Account Created!",
        `Welcome ${formData.firstName}! Account (${formData.role}) created successfully.`
      );

      navigate("/login");
    } catch (error) {
      console.warn("Registration API error:", error);
      const isNetworkError =
        !error.response ||
        error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        (error.message && error.message.toLowerCase().includes("network error"));

      if (isNetworkError) {
        showErrorAlert(
          "Backend Unavailable",
          "Backend server is unavailable. Please start the server and try again."
        );
      } else {
        const serverMsg = error.response?.data?.message || error.response?.data?.error || "Registration failed. Please try again.";
        showErrorAlert("Registration Failed", serverMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/80 via-purple-50/50 via-emerald-50/40 to-amber-50/60 dark:from-[#0B1120] dark:via-[#0F172A] dark:to-[#1E293B] text-slate-900 dark:text-[#F8FAFC] overflow-hidden px-4 py-4 sm:py-6 transition-colors duration-250">
      {/* Subtle Blueprint Grid Pattern */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-60 pointer-events-none" />

      {/* Top Right Theme Switcher */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 p-2.5 rounded-xl bg-white/80 dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#273449] transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
      >
        {isDark ? (
          <>
            <Sun size={16} className="text-amber-400" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon size={16} className="text-blue-600" />
            <span>Dark Mode</span>
          </>
        )}
      </button>

      {/* Multi-color Ambient Blurred Gradient Blobs */}
      <div className="absolute -top-16 -right-16 w-[34rem] h-[34rem] bg-blue-200/40 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />
      <div className="absolute -bottom-20 -left-20 w-[32rem] h-[32rem] bg-purple-200/40 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-white/95 dark:bg-[#111827]/95 rounded-3xl p-5 sm:p-7 shadow-xl dark:shadow-2xl dark:shadow-blue-950/40 border border-slate-200/90 dark:border-[#334155] backdrop-blur-xl transition-colors duration-250">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-md mb-2">
              <Building2 size={20} />
            </div>

            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Create Enterprise Workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter your details to access the property due diligence portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* ROW 1: First Name & Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-[#CBD5E1] uppercase tracking-wider mb-1">
                  First Name <span className="text-blue-600 dark:text-blue-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-blue-600 dark:text-blue-400" size={15} />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Rahul"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs font-medium transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-[#CBD5E1] uppercase tracking-wider mb-1">
                  Last Name <span className="text-blue-600 dark:text-blue-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 text-blue-600 dark:text-blue-400" size={15} />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Sharma"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs font-medium transition-all shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* ROW 2: Email Address */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-[#CBD5E1] uppercase tracking-wider mb-1">
                Email Address <span className="text-blue-600 dark:text-blue-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-purple-600 dark:text-purple-400" size={15} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs font-medium transition-all shadow-xs"
                />
              </div>
            </div>

            {/* ROW 3: Phone Number & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-[#CBD5E1] uppercase tracking-wider mb-1">
                  Phone Number <span className="text-blue-600 dark:text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-emerald-600 dark:text-emerald-400" size={15} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs font-mono transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-[#CBD5E1] uppercase tracking-wider mb-1">
                  Account Role <span className="text-blue-600 dark:text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-2.5 text-cyan-600 dark:text-cyan-400 pointer-events-none" size={15} />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs font-medium transition-all appearance-none cursor-pointer shadow-xs"
                  >
                    <option value="Buyer">Buyer</option>
                    <option value="Real Estate Agent">Real Estate Agent</option>
                    <option value="Legal Reviewer">Legal Reviewer</option>
                    <option value="Financial Institution">Financial Institution</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={15} />
                </div>
              </div>
            </div>

            {/* ROW 4: Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-[#CBD5E1] uppercase tracking-wider mb-1">
                  Password <span className="text-blue-600 dark:text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-amber-600 dark:text-amber-400" size={15} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs font-medium transition-all shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-[#CBD5E1] uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-blue-600 dark:text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 text-amber-600 dark:text-amber-400" size={15} />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 text-xs font-medium transition-all shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>

            {/* ROW 5: Complete Registration Button */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Complete Registration</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>

          {/* Bottom Sign In Link */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#334155] text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an enterprise account?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 dark:text-blue-400 hover:underline ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;