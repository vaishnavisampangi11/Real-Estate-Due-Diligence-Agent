import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  Sparkles,
  Search,
  LockKeyhole,
  FileText,
  MapPin,
  Sun,
  Moon,
  Users,
  Scale,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  X,
  FileSearch,
} from "lucide-react";
import { loginUser } from "../services/authService";
import { showErrorAlert, showSuccessAlert, showToast } from "../utils/swal";
import { useTheme } from "../context/ThemeContext";
import { getRoleDashboardPath } from "../utils/roleUtils";

function Login() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "ramacharan@enterprise.com",
    password: "Password123!",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(null);

  // Check URL error parameter on mount (e.g. redirected from OAuth failure)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam) {
      showErrorAlert("Authentication Notice", decodeURIComponent(errorParam));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTabChange = (adminMode) => {
    setIsAdminLogin(adminMode);
    if (adminMode) {
      setLoginData({
        email: "admin@realdiligence.in",
        password: "Password@123",
      });
    } else {
      setLoginData({
        email: "rajesh.kumar@gmail.com",
        password: "Password@123",
      });
    }
  };

  const handleGoogleLogin = () => {
    setSsoLoading("google");
    showToast("Redirecting to Google Single Sign-On...", "info");

    const apiBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
    const oauthUrl = `${apiBase}/oauth2/authorization/google`;

    window.location.href = oauthUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.email) {
      showErrorAlert("Email Required", "Please enter your email address.");
      return;
    }

    if (!loginData.email.includes("@")) {
      showErrorAlert("Invalid Email", "Please enter a valid email address format.");
      return;
    }

    if (!loginData.password) {
      showErrorAlert("Password Required", "Please enter your password.");
      return;
    }

    if (loginData.password.length < 6) {
      showErrorAlert("Weak Password", "Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({
        email: loginData.email,
        password: loginData.password,
      });

      if (response && response.data && response.data.token) {
        const userRole = response.data.role || "Buyer";
        const isUserAdmin = userRole === "Administrator";

        if (isAdminLogin && !isUserAdmin) {
          showErrorAlert(
            "Access Denied",
            "This portal tab is reserved for Administrators. Please switch to the 'Sign in' tab for customer and agent accounts."
          );
          setLoading(false);
          return;
        }

        if (!isAdminLogin && isUserAdmin) {
          showErrorAlert(
            "Administrator Login Required",
            "Please switch to the 'Administrator' portal tab to log in with administrative credentials."
          );
          setLoading(false);
          return;
        }

        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data));
        localStorage.setItem("role", userRole);
        showToast("Signed in successfully", "success");
        navigate(getRoleDashboardPath(userRole));
      } else {
        showErrorAlert("Login Failed", "Server did not return a valid authentication token.");
      }
    } catch (error) {
      console.warn("Backend login error:", error);
      const isNetworkError =
        !error.response ||
        error.code === "ERR_NETWORK" ||
        error.code === "ECONNABORTED" ||
        (error.message && error.message.toLowerCase().includes("network error"));

      if (isNetworkError) {
        showErrorAlert("Connection Error", "Cannot connect to the backend server. Please verify the Spring Boot service is running.");
      } else if (error.response?.status === 401) {
        showErrorAlert("Invalid Credentials", "Email or password is incorrect.");
      } else {
        const serverMsg = error.response?.data?.message || error.response?.data?.error || "Login request failed. Please try again.";
        showErrorAlert("Login Error", serverMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 dark:bg-[#0B1220] dark:text-white font-sans w-full relative overflow-hidden select-none transition-colors duration-200">
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#2563EB]/5 dark:bg-[#2563EB]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#10B981]/5 dark:bg-[#10B981]/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] left-[40%] w-[400px] h-[400px] rounded-full bg-cyan-500/2 dark:bg-cyan-500/5 blur-[100px] pointer-events-none" />

      {/* Top Right Theme/Back Trigger */}
      <div className="absolute top-6 right-6 z-20 flex items-center gap-4">
        <Link 
          to="/"
          className="py-2.5 px-4 rounded-xl bg-white dark:bg-[#111827]/80 border border-slate-200 dark:border-[#334155] shadow-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer text-xs font-semibold flex items-center justify-center"
        >
          Back to Site
        </Link>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-white dark:bg-[#111827]/80 border border-slate-200 dark:border-[#334155] shadow-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
        >
          {isDark ? (
            <>
              <Sun size={14} className="text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={14} className="text-blue-500" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Left Column: Brand Identity & AI Dashboard Preview Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden border-r border-slate-200 dark:border-slate-900 select-none">
        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10 text-left">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#10B981] flex items-center justify-center text-white shadow-md shrink-0">
            <Building2 size={20} />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white leading-none">
              Estate<span className="text-[#2563EB]">IQ</span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase leading-none mt-1">
              Intelligent Property Due Diligence Platform
            </span>
          </div>
        </div>

        {/* AI Dashboard & Risk Meter Mockup Left pane */}
        <div className="space-y-6 relative z-10 my-auto max-w-xl text-left py-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Verify. Analyze. Protect.
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Verify land ownership, analyze legal risks, and generate trusted property reports with AI-powered intelligence.
            </p>
          </div>

          {/* Verification Preview Card */}
          <div className="w-full rounded-2xl border border-slate-250 dark:border-slate-800 bg-white/80 dark:bg-[#111827]/80 p-5 shadow-2xl relative overflow-hidden space-y-4">
            {/* Blueprint Grid Lines background */}
            <div className="absolute inset-0 bg-blueprint-grid opacity-[0.15] pointer-events-none" />

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <div className="flex items-center gap-2">
                <FileSearch size={16} className="text-[#2563EB]" />
                <span className="text-xs font-extrabold text-slate-850 dark:text-white uppercase tracking-wider">AUDIT DASHBOARD PREVIEW</span>
              </div>
              <span className="text-[10px] font-bold text-[#10B981] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                ACTIVE PIPELINE
              </span>
            </div>

            {/* AI Risk Meter Gauge Illustration */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-5 text-center space-y-2">
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest block">AI RISK INDEX</span>
                
                {/* SVG Gauge */}
                <div className="relative w-24 h-14 mx-auto">
                  <svg className="w-full h-full text-slate-200 dark:text-slate-800/80" viewBox="0 0 100 50">
                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
                    <path d="M 10 50 A 40 40 0 0 1 45 16" fill="none" stroke="#10B981" strokeWidth="8" strokeLinecap="round" />
                    <line x1="50" y1="50" x2="38" y2="18" stroke="#2563EB" strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx="50" cy="50" r="4.5" fill="#2563EB" />
                  </svg>
                </div>
                
                <span className="inline-block text-[10px] font-bold text-[#10B981] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-250 dark:border-emerald-900">
                  1.2 / 10 Low Risk
                </span>
              </div>

              {/* Document details checklist */}
              <div className="sm:col-span-7 space-y-2 text-xs font-semibold text-slate-655 dark:text-[#94A3B8] border-l border-slate-100 dark:border-slate-850 pl-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#10B981]" />
                  <span>Transfer Deed Authenticated</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#10B981]" />
                  <span>No Undisclosed Easements</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#10B981]" />
                  <span>Lien Records Checked (Clear)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-[#10B981]" />
                  <span>Spatial GIS Overlays Matched</span>
                </div>
              </div>
            </div>

            {/* GIS parcel line vector map overlay */}
            <div className="h-20 w-full rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/70 p-2 relative overflow-hidden flex items-center justify-between">
              <div className="absolute inset-0 bg-blueprint-grid opacity-10" />
              <svg className="w-32 h-full text-slate-350 dark:text-slate-850" viewBox="0 0 100 100">
                <polygon points="10,20 80,10 70,80 30,70" stroke="currentColor" fill="none" strokeWidth="1.5" />
              </svg>
              <div className="text-[9px] font-mono text-slate-500 dark:text-slate-550 text-right pr-2">
                PLOT BOUNDARY METRICS:<br />
                APN: 408-22-104D<br />
                COORDS: 12.971° N
              </div>
            </div>

          </div>

          {/* Small Features checks */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm font-semibold text-slate-550 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2563EB]" />
              <span>AI Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#10B981]" />
              <span>Government Records</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#10B981]" />
              <span>Legal Compliance</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#2563EB]" />
              <span>Bank Ready Reports</span>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-4 gap-4 border-t border-slate-200 dark:border-slate-900 pt-8 relative z-10 text-left">
          <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">50K+</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold mt-1">Verified Properties</p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">99.8%</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold mt-1">Verification Accuracy</p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">500+</h4>
            <p className="text-[10px] text-slate-450 dark:text-slate-500 uppercase tracking-wider font-semibold mt-1">Enterprise Clients</p>
          </div>
          <div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">24/7</h4>
            <p className="text-[10px] text-slate-455 dark:text-slate-500 uppercase tracking-wider font-semibold mt-1">Availability</p>
          </div>
        </div>
      </div>

      {/* Right Column: Floating Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center pt-24 pb-12 px-6 sm:px-12 relative z-10">
        <div className="w-full max-w-md bg-white dark:bg-[#111827]/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl transition-all hover:border-slate-300 dark:hover:border-slate-700/50">
          
          {/* Form Header */}
          <div className="flex flex-col items-start mb-6">
            {/* Mobile-only logo */}
            <div className="lg:hidden w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#10B981] flex items-center justify-center text-white shadow-md mb-4">
              <Building2 size={18} />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight animate-fade-in">
              Welcome back
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Sign in to your EstateIQ workspace.
            </p>
          </div>

          {/* Portal Toggle Switcher (Radio Style) */}
          <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-950/60 border border-slate-200/50 dark:border-[#1E293B] mb-6 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTabChange(false)}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                !isAdminLogin
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700/50"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full border shrink-0 transition-all ${!isAdminLogin ? "border-[#2563EB] bg-[#2563EB]" : "border-slate-300 dark:border-slate-700 bg-transparent"}`} />
              <span>Sign in</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange(true)}
              className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                isAdminLogin
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200 dark:bg-slate-800 dark:text-white dark:border-slate-700/50"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full border shrink-0 transition-all ${isAdminLogin ? "border-[#10B981] bg-[#10B981]" : "border-slate-300 dark:border-slate-700 bg-transparent"}`} />
              <span>Administrator</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={16} />
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-655 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] text-sm transition-all"
                />
              </div>
            </div>

            <div className="text-left">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-bold text-[#2563EB] hover:text-blue-550 transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400 dark:text-slate-500" size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-[#1E293B] border border-slate-250 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-655 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB] text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-655 dark:hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#10B981] hover:from-[#1D4ED8] hover:to-[#0D9488] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] mt-2 disabled:opacity-50"
            >
              <span>{loading ? "Signing In..." : "Continue to Dashboard →"}</span>
            </button>
          </form>

          {/* SSO Dividers */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute w-full h-[1px] bg-slate-200 dark:bg-slate-800" />
            <span className="relative z-10 px-3 bg-white dark:bg-[#111827] text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              OR CONTINUE WITH
            </span>
          </div>

          {/* Enterprise Single Sign-On (SSO) OAuth2 Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={Boolean(ssoLoading)}
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#1E293B] dark:hover:bg-slate-800 border border-slate-250 dark:border-slate-700 transition-all flex items-center justify-center gap-3 cursor-pointer text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white shadow-xs disabled:opacity-60"
            >
              {ssoLoading === "google" ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              )}
              <span>{ssoLoading === "google" ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>
          </div>

          {/* Support & Legal Links */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-850 text-center space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Don't have an enterprise account?{" "}
              <Link
                to="/register"
                className="font-bold text-[#2563EB] hover:underline ml-1"
              >
                Create Account
              </Link>
            </p>

            <div className="flex justify-center gap-4 text-[10px] font-semibold text-slate-450 dark:text-slate-500">
              <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Policy</Link>
              <span>•</span>
              <Link to="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
              <span>•</span>
              <Link to="/help" className="hover:text-slate-900 dark:hover:text-white transition-colors">Support</Link>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-600">
              Enterprise Support: <a href="mailto:support@estateiq.com" className="hover:underline text-slate-600 dark:text-slate-500">support@estateiq.com</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;