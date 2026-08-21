import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Building2,
  User,
  Phone,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
  Scale,
  Landmark,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { registerOAuthUser } from "../services/authService";
import { showErrorAlert, showSuccessAlert } from "../utils/swal";
import { getRoleDashboardPath } from "../utils/roleUtils";
import { useTheme } from "../context/ThemeContext";

const AVAILABLE_ROLES = [
  {
    id: "Buyer",
    title: "Property Buyer",
    description: "Search verified properties, evaluate risks, and review due diligence certificates.",
    icon: ShoppingBag,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "Real Estate Agent",
    title: "Real Estate Agent",
    description: "Manage client listings, coordinate document verifications, and monitor compliance.",
    icon: Briefcase,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "Legal Reviewer",
    title: "Legal Reviewer",
    description: "Examine encumbrance certificates, survey titles, court disputes, and zoning bylaws.",
    icon: Scale,
    color: "from-purple-500 to-indigo-600",
  },
  {
    id: "Financial Institution",
    title: "Financial Institution",
    description: "Underwrite loan collaterals, audit mortgage risks, and review title clearance reports.",
    icon: Landmark,
    color: "from-amber-500 to-orange-600",
  },
];

export default function CompleteOAuthRegistration() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const oauthToken = searchParams.get("oauthToken") || "";
  const verifiedEmail = searchParams.get("email") || "";
  const initialFirstName = searchParams.get("firstName") || "";
  const initialLastName = searchParams.get("lastName") || "";
  const provider = (searchParams.get("provider") || "google").toLowerCase();

  const [formData, setFormData] = useState({
    firstName: initialFirstName,
    lastName: initialLastName,
    phone: "",
    role: "Buyer",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!oauthToken || !verifiedEmail) {
      showErrorAlert(
        "Authentication Error",
        "Invalid or missing OAuth session. Please sign in again with your Google or Microsoft account."
      );
      navigate("/login");
    }
  }, [oauthToken, verifiedEmail, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showErrorAlert("Required Fields", "Please enter your first and last name.");
      return;
    }

    if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone.trim())) {
      showErrorAlert("Invalid Phone Number", "Please provide a valid 10-digit mobile number.");
      return;
    }

    if (!formData.role) {
      showErrorAlert("Role Required", "Please choose your platform role to complete setup.");
      return;
    }

    setLoading(true);

    try {
      const response = await registerOAuthUser({
        oauthToken,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
      });

      const data = response.data;
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          userId: data.userId,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
        })
      );
      localStorage.setItem("isLoggedIn", "true");

      await showSuccessAlert(
        "Account Created!",
        `Welcome to EstateIQ, ${data.firstName}! Your verified ${provider === "google" ? "Google" : "Microsoft"} account has been activated.`
      );

      navigate(getRoleDashboardPath(data.role), { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Could not complete registration. Please try again.";
      showErrorAlert("Registration Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-[#0B1220] transition-colors">
      {/* Theme Toggle Top Right */}
      <div className="fixed top-5 right-5 z-20">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs hover:scale-105 transition-all cursor-pointer"
        >
          {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
        </button>
      </div>

      <div className="w-full max-w-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 my-8 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-2 shadow-xs">
            <Building2 size={32} />
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={14} />
              Verified via {provider === "microsoft" ? "Microsoft" : "Google"}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Complete Your Registration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Your {provider === "microsoft" ? "Microsoft" : "Google"} account identity has been verified. Please confirm your details and select your workspace role.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Verified Email Field (Read-only) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Verified Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={verifiedEmail}
                readOnly
                disabled
                className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-250 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold cursor-not-allowed select-none"
              />
              <div className="absolute right-3.5 top-3 text-emerald-500 flex items-center gap-1 text-[11px] font-bold">
                <CheckCircle2 size={16} />
                <span>Verified</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">
              This email is cryptographically verified by {provider === "microsoft" ? "Microsoft" : "Google"} and cannot be altered.
            </p>
          </div>

          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:bg-white dark:focus:bg-[#111827] text-slate-900 dark:text-white text-xs transition-all outline-none"
                />
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:bg-white dark:focus:bg-[#111827] text-slate-900 dark:text-white text-xs transition-all outline-none"
                />
                <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile number (e.g. 9876543210)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                className="w-full px-4 py-3 pl-10 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-slate-800 focus:border-blue-600 focus:bg-white dark:focus:bg-[#111827] text-slate-900 dark:text-white text-xs transition-all outline-none font-mono"
              />
              <Phone size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          {/* Role Selection Cards (Administrator explicitly excluded) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Your Platform Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = formData.role === role.id;
                return (
                  <div
                    key={role.id}
                    onClick={() => setFormData({ ...formData, role: role.id })}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#111827]"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div
                        className={`p-2 rounded-xl text-white bg-gradient-to-br ${role.color} shrink-0`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {role.title}
                          </h4>
                          {isSelected && (
                            <CheckCircle2 size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-2">
              Note: Administrator role accounts are provisioned via system security policy and cannot be self-selected.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration & Enter Workspace</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            to="/login"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            ← Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
