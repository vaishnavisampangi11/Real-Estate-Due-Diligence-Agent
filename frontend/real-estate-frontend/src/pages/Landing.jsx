import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  BrainCircuit,
  FileSearch,
  Scale,
  TrendingUp,
  ShieldCheck,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowUpRight,
  Database,
  Search,
  Shield,
  Sun,
  Moon,
  MapPin,
  Mail,
  Phone,
  Layers,
  Activity,
  FileText,
  BadgeAlert,
  Info,
  CheckSquare,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Animated Counter Component
function AnimatedCounter({ target, duration = 1000 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(target.replace(/[^0-9]/g, "")) || 0;
    if (end === 0) {
      setCount(target);
      return;
    }
    const stepTime = Math.max(Math.floor(duration / (end / 5)), 10);
    const timer = setInterval(() => {
      start += Math.ceil(end / 40);
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  const nonNumeric = target.replace(/[0-9]/g, "");
  return (
    <span>
      {count}
      {nonNumeric}
    </span>
  );
}

function Landing() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Smooth scroll helper
  const handleScrollTo = (sectionId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: BrainCircuit,
      title: "AI Property Intelligence",
      description: "Extract ownership details, easements, and covenants automatically using language models trained on historical title sheets.",
      accent: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800",
    },
    {
      icon: FileSearch,
      title: "Title Verification",
      description: "Analyze the complete title chain records to identify broken transfers, undisclosed heirs, or unresolved title disputes instantly.",
      accent: "text-[#10B981] dark:text-[#10B981]",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-250 dark:border-emerald-800/80",
    },
    {
      icon: Scale,
      title: "Legal Compliance",
      description: "Verify building code permits, municipal zoning guidelines, tax obligations, and local environmental compliance guidelines.",
      accent: "text-[#10B981] dark:text-[#10B981]",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-250 dark:border-emerald-800/80",
    },
    {
      icon: TrendingUp,
      title: "Market Analytics",
      description: "Assess local property pricing trends, historical transactions, property valuation history, and district growth rates.",
      accent: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-50 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800",
    },
    {
      icon: Lock,
      title: "Secure Authentication",
      description: "Role-based workspace access logs with end-to-end cryptographic file storage protecting confidential deal metrics.",
      accent: "text-[#10B981] dark:text-[#10B981]",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-250 dark:border-emerald-800/80",
    },
    {
      icon: FileCheck,
      title: "Smart Reports",
      description: "Generate legally compliant executive summaries detailing risk ratings, property boundaries, and zoning parameters in one PDF.",
      accent: "text-[#10B981] dark:text-[#10B981]",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-250 dark:border-emerald-800/80",
    },
  ];

  const steps = [
    {
      num: "01",
      title: "Register Account",
      desc: "Set up your secure profile and configure role-based access for your enterprise team members.",
    },
    {
      num: "02",
      title: "Search Property",
      desc: "Input APN, registration ID, or location survey numbers to search municipal databases.",
    },
    {
      num: "03",
      title: "AI Verification",
      desc: "Let our cognitive engines parse title records, encumbrances, and municipal risk factors.",
    },
    {
      num: "04",
      title: "Download Report",
      desc: "Obtain a complete verified Due Diligence report containing audit history and risk flags.",
    },
  ];

  const stats = [
    { icon: "🏠", value: "50K+", label: "Verified Properties" },
    { icon: "⚖", value: "98%", label: "Verification Accuracy" },
    { icon: "🏢", value: "500+", label: "Enterprise Clients" },
    { icon: "🌎", value: "24/7", label: "Availability" },
  ];

  const testimonials = [
    {
      quote: "EstateIQ has automated our manual property investigation workflow. We reduced our title analysis cycle times from weeks to under five minutes.",
      author: "Sarah Jenkins",
      company: "Jenkins & Thorne Legal",
      role: "Partner",
      avatar: "SJ",
      stars: 5,
    },
    {
      quote: "The risk assessment model correctly flagged three major easements that would have halted our commercial development project. Truly invaluable tool.",
      author: "Marcus Vance",
      company: "Capital Real Estate Corp",
      role: "VP of Investments",
      avatar: "MV",
      stars: 5,
    },
    {
      quote: "Having automated municipal tax audit checks integration is a game changer for our underwriting team. Compliance rates are at an all-time high.",
      author: "Elena Rostova",
      company: "Apex Lending Group",
      role: "Chief Compliance Officer",
      avatar: "ER",
      stars: 5,
    },
  ];

  const faqs = [
    {
      q: "How does the AI verify property title records?",
      a: "Our system uses optical character recognition (OCR) and custom natural language processing algorithms trained on land registry files. It reconstructs ownership chains and cross-references historical transfer deeds to flag potential discontinuities or encumbrances.",
    },
    {
      q: "Can the platform connect directly to local municipal databases?",
      a: "Yes, EstateIQ integrates with state land registry APIs, municipal tax records, and spatial zoning databases to retrieve certified, live data for analysis.",
    },
    {
      q: "What roles are supported in the workspace portals?",
      a: "The system provides role-based spaces custom-tailored for Buyers (view reports and search properties), Agents (facilitate diligence requests), Legal Reviewers (review compliance), and Financial Underwriters (verify loan viability).",
    },
    {
      q: "Are the reports generated legally binding?",
      a: "Our reports act as certified summaries of historical public data. They are designed to support and accelerate your internal compliance procedures, underwriting analysis, and legal reviews.",
    },
    {
      q: "How secure is the property documentation loaded into the system?",
      a: "All database transfers are encrypted in transit and at rest using AES-256 standards. Our security architecture includes role-based access tokens to ensure that only authorized personnel can view your properties.",
    },
    {
      q: "Can I customize the risk parameters in the reports?",
      a: "Yes. Through the Administrator settings, corporate clients can define Custom Risk thresholds to match their internal risk appetite guidelines.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1220] text-slate-800 dark:text-white font-sans overflow-x-hidden transition-colors duration-250 relative">
      {/* Subtle Blueprint & Grid Background overlays */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-blueprint-grid opacity-[0.02] dark:opacity-[0.04] pointer-events-none z-0" />

      {/* 1. Sticky Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 dark:bg-[#0B1220]/85 backdrop-blur-md border-b border-slate-200 dark:border-[#334155] py-4 shadow-xs"
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-8xl mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => handleScrollTo("home")}
            className="flex items-center gap-2.5 font-extrabold text-xl tracking-tight cursor-pointer select-none text-slate-900 dark:text-white"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 size={18} />
            </div>
            <span>
              Estate<span className="text-[#2563EB]">IQ</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-655 dark:text-[#94A3B8]">
            <button
              onClick={() => handleScrollTo("home")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => handleScrollTo("features")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleScrollTo("solutions")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Solutions
            </button>
            <button
              onClick={() => handleScrollTo("how-it-works")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => handleScrollTo("pricing")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => handleScrollTo("faq")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => handleScrollTo("contact")}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Contact
            </button>
          </div>

          {/* Nav Buttons & Theme Switcher */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#111827] dark:hover:bg-slate-850 border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-blue-600" />}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 text-sm font-semibold text-slate-655 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#10B981] hover:from-[#1D4ED8] hover:to-[#0D9488] text-white text-sm font-semibold shadow-md shadow-blue-500/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              Start Verification
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#334155] text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-blue-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-655 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-[#0B1220] border-b border-slate-200 dark:border-[#334155] px-6 py-6 space-y-4 shadow-xl">
            <div className="flex flex-col gap-4 text-base font-medium text-slate-655 dark:text-[#94A3B8]">
              <button
                onClick={() => handleScrollTo("home")}
                className="text-left py-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => handleScrollTo("features")}
                className="text-left py-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Features
              </button>
              <button
                onClick={() => handleScrollTo("solutions")}
                className="text-left py-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Solutions
              </button>
              <button
                onClick={() => handleScrollTo("how-it-works")}
                className="text-left py-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => handleScrollTo("pricing")}
                className="text-left py-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Pricing
              </button>
              <button
                onClick={() => handleScrollTo("faq")}
                className="text-left py-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                FAQ
              </button>
              <button
                onClick={() => handleScrollTo("contact")}
                className="text-left py-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Contact
              </button>
            </div>
            <div className="border-t border-slate-200 dark:border-[#334155] pt-4 flex flex-col gap-3">
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2.5 text-center text-sm font-semibold text-slate-655 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#10B981] text-white text-center text-sm font-semibold cursor-pointer"
              >
                Start Verification
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. Hero Section with realistic product preview mockup */}
      <header
        id="home"
        className="relative pt-36 pb-16 md:pt-48 md:pb-20 flex items-center justify-between"
      >
        {/* Glow ambient backgrounds */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-[#2563EB]/5 dark:bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute top-1/3 right-1/10 w-96 h-96 bg-[#10B981]/5 dark:bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="max-w-8xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
          {/* Hero text */}
          <div className="lg:col-span-6 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#334155] text-blue-750 dark:text-[#10B981] text-xs font-semibold shadow-xs">
              <Sparkles size={14} className="text-blue-600 dark:text-[#10B981]" /> Built for Modern Underwriting & Legal Teams
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              AI-Powered <br />
              <span className="bg-gradient-to-r from-[#2563EB] to-[#10B981] bg-clip-text text-transparent">
                Property Due Diligence
              </span>
            </h1>

            <p className="text-slate-650 dark:text-[#94A3B8] text-lg sm:text-xl font-medium leading-relaxed max-w-2xl">
              Verify ownership, detect legal risks, analyze market insights, and generate compliance reports instantly using enterprise-grade cognitive engines.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate("/login")}
                className="px-7 py-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#10B981] hover:from-[#1D4ED8] hover:to-[#0D9488] text-white text-base font-semibold shadow-lg shadow-blue-500/15 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Start Property Verification</span>
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => handleScrollTo("contact")}
                className="px-7 py-4 rounded-xl bg-white hover:bg-slate-100 dark:bg-[#111827] dark:hover:bg-[#2D3F58] border border-slate-200 dark:border-[#334155] text-slate-800 dark:text-white text-base font-semibold transition-all cursor-pointer shadow-xs hover:shadow-md"
              >
                Request Enterprise Demo
              </button>
            </div>
          </div>

          {/* High-Fidelity Product Workspace Mockup */}
          <div className="lg:col-span-6 flex items-center justify-center">
            <div className="w-full max-w-xl rounded-2xl border border-slate-250 dark:border-slate-800/80 bg-white/90 dark:bg-[#111827]/90 shadow-2xl backdrop-blur-md overflow-hidden text-left flex flex-col z-10 transition-all hover:scale-[1.01] duration-300">
              {/* Toolbar Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="px-3 py-1 text-[10px] rounded-lg bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-slate-850 text-slate-500 dark:text-[#94A3B8] font-mono flex items-center gap-1.5 w-60 justify-center shadow-xs">
                  <Lock size={10} className="text-slate-400" />
                  <span>app.estateiq.ai/search?apn=408-22</span>
                </div>
                <div className="w-10" />
              </div>

              {/* Workspace Contents */}
              <div className="p-5 space-y-4">
                {/* Search Bar HUD info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-850">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-[#94A3B8] tracking-widest uppercase">Property Address</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">742 Evergreen Terrace, Sector 4</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#10B981] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Verified
                    </span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 px-2 py-0.5 rounded-full">
                      APN 408-22
                    </span>
                  </div>
                </div>

                {/* Grid Panels */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">AI Confidence</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">99.8%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Risk Score</span>
                    <span className="text-base font-bold text-emerald-500">1.2 (Low)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Market Value</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">$1.24M</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-850">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">Tax Status</span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">Paid (FY26)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Mock Map Vector layout */}
                  <div className="sm:col-span-5 h-36 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-slate-950/80 relative overflow-hidden flex items-center justify-center p-2">
                    <div className="absolute inset-0 bg-blueprint-grid opacity-30" />
                    {/* Plot coordinates geometry outline */}
                    <svg className="w-full h-full text-[#2563EB] dark:text-[#10B981]" viewBox="0 0 100 100" fill="currentColor" fillOpacity="0.08">
                      <polygon points="20,20 80,15 90,75 30,85 15,55" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2" />
                      <line x1="20" y1="20" x2="90" y2="75" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                      <circle cx="50" cy="50" r="2.5" fill="currentColor" />
                    </svg>
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-sm bg-white/90 dark:bg-[#111827]/90 text-[8px] font-semibold font-mono border border-slate-200 dark:border-slate-850 text-slate-550 dark:text-slate-400">
                      PLOT 104D
                    </div>
                  </div>

                  {/* Diligence checklist and Ownership audit trail */}
                  <div className="sm:col-span-7 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">Compliance Dossier</span>
                      <div className="grid grid-cols-2 gap-2 mt-1.5 text-xs font-semibold text-slate-650 dark:text-[#94A3B8]">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-[#10B981]" />
                          <span>Zoning OK (R-2)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-[#10B981]" />
                          <span>Title Search Clear</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-[#10B981]" />
                          <span>Easement Cleaned</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} className="text-[#10B981]" />
                          <span>Lien Review Clear</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-850">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider block">Ownership history (Simplified)</span>
                      <div className="mt-1 text-[11px] font-medium text-slate-550 dark:text-[#94A3B8] space-y-1 font-mono">
                        <p>1994: Springfield Town ➔ Homer Simpson</p>
                        <p>2005: Homer Simpson ➔ Land Trust Corp</p>
                        <p className="text-slate-900 dark:text-white font-semibold">2026: Land Trust Corp ➔ Enterprise LLC</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2b. Trust Badges Row */}
      <section className="py-6 border-b border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0B1220]/50 relative z-10">
        <div className="max-w-8xl mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-center md:justify-between gap-6 text-sm font-semibold text-slate-655 dark:text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-[#10B981]" />
            <span>Government Records Verified</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-[#2563EB]" />
            <span>AI Powered Verification</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-[#10B981]" />
            <span>Bank Ready Reports</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-[#2563EB]" />
            <span>Legal Compliance Certified</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare size={16} className="text-[#10B981]" />
            <span>Secure Document Analysis</span>
          </div>
        </div>
      </section>

      {/* 3. Trusted By Sectors */}
      <section className="py-12 bg-slate-100/50 dark:bg-[#111827]/20 border-b border-slate-200 dark:border-[#334155] transition-colors relative z-10">
        <div className="max-w-8xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#94A3B8] mb-8">
            Empowering Property Diligence Across Sectors
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
            {["Government Agencies", "Commercial Banks", "Legal Firms", "Enterprise Builders", "Private Investors"].map(
              (sector, idx) => (
                <div
                  key={idx}
                  className="px-5 py-4 rounded-xl bg-white dark:bg-[#111827]/40 border border-slate-200 dark:border-[#334155]/60 text-sm font-bold text-slate-655 dark:text-[#94A3B8] tracking-tight hover:text-slate-900 dark:hover:text-white transition-all select-none shadow-xs hover:border-[#2563EB]/40 dark:hover:border-[#10B981]/40"
                >
                  {sector}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-24 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2563EB]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Platform Capabilities</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">Every Layer of Diligence, Unified</h3>
            <p className="text-slate-600 dark:text-[#94A3B8] max-w-xl mx-auto text-base">
              Say goodbye to manual archives. EstateIQ connects data systems to deliver verified records in minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="group p-8 rounded-2xl bg-white hover:bg-slate-50/60 dark:bg-[#111827]/30 dark:hover:bg-[#111827]/50 border border-slate-200 dark:border-[#334155] hover:border-blue-500/40 dark:hover:border-[#10B981]/40 transition-all duration-300 text-left flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div className="space-y-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${feature.iconBg} ${feature.accent} group-hover:scale-105 duration-250`}>
                      <Icon size={24} />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#2563EB] transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-slate-600 dark:text-[#94A3B8] text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div className="mt-6">
                    <span className="text-xs font-bold text-[#2563EB] dark:text-[#10B981] group-hover:underline inline-flex items-center gap-1 cursor-pointer">
                      Learn More <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Connected Process Section */}
      <section id="how-it-works" className="py-24 bg-slate-150/40 dark:bg-[#111827]/10 border-t border-slate-200 dark:border-[#334155] relative z-10">
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10B981]">Process</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">How EstateIQ Works</h3>
            <p className="text-slate-600 dark:text-[#94A3B8] max-w-xl mx-auto text-base">
              An automated property investigation completed in four simple stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Desktop timeline horizontal line */}
            <div className="hidden md:block absolute top-[27px] left-8 right-8 h-[2px] bg-gradient-to-r from-[#2563EB] via-[#10B981] to-[#06B6D4] opacity-20 z-0" />

            {steps.map((step, idx) => (
              <div key={idx} className="relative group text-left space-y-4">
                <div className="relative z-10 w-14 h-14 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] flex items-center justify-center text-lg font-extrabold text-[#10B981] shadow-sm group-hover:border-[#10B981]/60 transition-all">
                  {step.num}
                  {/* Pulsing indicator overlay on step active */}
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping opacity-60 hidden group-hover:block" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white pt-2">{step.title}</h4>
                <p className="text-slate-600 dark:text-[#94A3B8] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Solutions & Statistics (with animated counters) */}
      <section id="solutions" className="py-24 relative border-t border-slate-200 dark:border-[#334155] z-10">
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-left">
              <div className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Underwriting Intelligence</h2>
                <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight">
                  Why Institutional Teams Trust EstateIQ
                </h3>
                <p className="text-slate-600 dark:text-[#94A3B8] text-base leading-relaxed">
                  We integrate municipal, legal, and environmental databases, giving transactional teams a unified compliance checking workspace.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: "Reduce Risk Profile", desc: "Flag historical title disputes early." },
                  { title: "Save Operational Costs", desc: "Eliminate manual file retrieval delays." },
                  { title: "Accelerate Closures", desc: "Compile full compliance dossiers in minutes." },
                  { title: "Enterprise Integrations", desc: "Designed to support high transaction volumes." },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <CheckCircle2 className="text-blue-600 dark:text-[#2563EB] shrink-0 mt-1" size={18} />
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">{item.title}</h5>
                      <p className="text-xs text-slate-500 dark:text-[#94A3B8] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics with dynamic counters */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-8 rounded-2xl bg-white dark:bg-[#111827]/30 border border-slate-200 dark:border-[#334155] text-left hover:border-blue-500/30 dark:hover:border-[#10B981]/30 transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
                >
                  <div className="text-3xl select-none">{stat.icon}</div>
                  <h4 className="text-3xl sm:text-5xl font-extrabold bg-gradient-to-r from-slate-900 dark:from-white to-slate-600 dark:to-[#94A3B8] bg-clip-text text-transparent mt-2">
                    <AnimatedCounter target={stat.value} />
                  </h4>
                  <p className="text-slate-500 dark:text-[#94A3B8] text-xs font-semibold uppercase tracking-wider mt-4">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Testimonials (with star ratings & avatars) */}
      <section className="py-24 bg-slate-100/40 dark:bg-[#111827]/10 border-t border-slate-200 dark:border-[#334155] relative z-10">
        <div className="max-w-8xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Success Stories</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">Approved by Compliance Leaders</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-8 rounded-2xl bg-white dark:bg-[#111827]/30 border border-slate-200 dark:border-[#334155] flex flex-col justify-between text-left group hover:border-blue-500/30 dark:hover:border-[#2563EB]/30 transition-all duration-300 shadow-xs hover:shadow-md"
              >
                <div>
                  {/* Star Ratings */}
                  <div className="flex gap-1 mb-5 text-amber-500">
                    {Array.from({ length: t.stars }).map((_, sIdx) => (
                      <span key={sIdx} className="text-sm">★</span>
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-[#94A3B8] text-sm leading-relaxed italic">
                    "{t.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-4 mt-8">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#10B981] flex items-center justify-center text-xs font-bold text-white shadow-md">
                    {t.avatar}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">{t.author}</h5>
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
                      {t.role}, <span className="font-semibold text-slate-700 dark:text-slate-350">{t.company}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section id="faq" className="py-24 border-t border-slate-200 dark:border-[#334155] relative z-10">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10B981]">Information Center</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-white dark:bg-[#111827]/30 border border-slate-200 dark:border-[#334155] overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between font-bold text-slate-900 dark:text-white hover:text-[#10B981] transition-colors cursor-pointer select-none text-base"
                >
                  <span className="flex items-center gap-3">
                    <Info size={16} className="text-slate-400 dark:text-slate-500" />
                    <span>{faq.q}</span>
                  </span>
                  {activeFaq === idx ? (
                    <ChevronUp size={18} className="text-[#10B981]" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400 dark:text-[#94A3B8]" />
                  )}
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-slate-655 dark:text-[#94A3B8] leading-relaxed border-t border-slate-100 dark:border-[#334155]/60 pt-4 transition-all duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Call To Action */}
      <section className="py-24 border-t border-slate-200 dark:border-[#334155] relative overflow-hidden z-10">
        {/* Glow blob */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB]/5 dark:from-[#2563EB]/10 via-[#10B981]/2 dark:via-[#10B981]/5 to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ready to Verify Properties with Confidence?
          </h2>
          <p className="text-slate-655 dark:text-[#94A3B8] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Create an enterprise profile or speak with a diligence specialist about integration pipelines.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#10B981] hover:from-[#1D4ED8] hover:to-[#0D9488] text-white text-base font-semibold shadow-lg shadow-blue-500/15 active:scale-[0.98] transition-all cursor-pointer"
            >
              Start Property Verification
            </button>
            <button
              onClick={() => handleScrollTo("contact")}
              className="px-8 py-4 rounded-xl bg-white hover:bg-slate-55 border border-slate-250 dark:bg-[#111827] dark:hover:bg-[#2D3F58] dark:border-[#334155] text-slate-800 dark:text-white text-base font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Request Enterprise Demo
            </button>
          </div>
        </div>
      </section>

      {/* 10. Contact Section with map illustration */}
      <section id="contact" className="py-24 border-t border-slate-200 dark:border-[#334155] bg-slate-100/30 dark:bg-[#111827]/10 relative z-10">
        <div className="max-w-8xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Details & Map Illustration */}
          <div className="lg:col-span-5 text-left space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">Get in touch</h2>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Speak with an Expert</h3>
              </div>
              <p className="text-slate-600 dark:text-[#94A3B8] text-sm leading-relaxed">
                Have questions about platform integration, pricing structures, or accuracy guarantees? Our compliance specialists are available to consult.
              </p>
              <div className="space-y-4 text-sm text-slate-655 dark:text-[#94A3B8] pt-2">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#2563EB] shrink-0 mt-0.5" />
                  <p><span className="font-bold text-slate-900 dark:text-white">Address:</span> TechHub Executive Offices, Suite 400, Bangalore, India</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#10B981] shrink-0" />
                  <p><span className="font-bold text-slate-900 dark:text-white">Email:</span> solutions@estateiq.ai</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[#06B6D4] shrink-0" />
                  <p><span className="font-bold text-slate-900 dark:text-white">Phone:</span> +91 (80) 4902-8800</p>
                </div>
              </div>
            </div>

            {/* GIS Plot illustration */}
            <div className="w-full h-36 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]/40 p-4 relative overflow-hidden hidden lg:flex items-center justify-center shadow-xs">
              <div className="absolute inset-0 bg-blueprint-grid opacity-15" />
              <svg className="w-full h-full text-slate-350 dark:text-slate-700/80" viewBox="0 0 100 100" fill="currentColor" fillOpacity="0.05">
                <polygon points="10,30 90,10 75,90 25,75" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
                {/* coordinate axes */}
                <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              </svg>
              <div className="absolute bottom-3 left-3 text-[9px] font-mono text-slate-500 dark:text-slate-500">
                HQ OFFICE COORDINATES: 12.9716° N, 77.5946° E
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast("Request received! An advisor will reach out shortly.", "success");
                e.target.reset();
              }}
              className="p-8 rounded-2xl bg-white dark:bg-[#111827]/40 border border-slate-200 dark:border-[#334155] space-y-4 text-left shadow-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-2">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-250 dark:border-[#334155] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-2">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="john@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-250 dark:border-[#334155] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about your property diligence volumes..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#0B1220] border border-slate-250 dark:border-[#334155] text-slate-900 dark:text-white focus:outline-none focus:border-[#2563EB] text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-sm transition-colors cursor-pointer shadow-sm"
              >
                Send Request
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 11. Pricing Section formatted for Enterprise */}
      <section id="pricing" className="py-24 border-t border-slate-200 dark:border-[#334155] bg-slate-100/50 dark:bg-[#111827]/20 relative z-10">
        <div className="max-w-8xl mx-auto px-6 lg:px-12 text-center">
          <div className="space-y-4 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10B981]">Billing</h2>
            <h3 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">Simple, Transparent Pricing</h3>
            <p className="text-slate-655 dark:text-[#94A3B8] max-w-xl mx-auto text-base">
              Choose the operational tier matching your transaction pipelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
            {[
              {
                tier: "Government Agency Portal",
                price: "$299",
                period: "per month",
                features: ["Up to 50 property searches/mo", "Standard title parsing", "Email support", "Single user license", "Public registry audits"],
                cta: "Choose Government",
                accent: "border-slate-200 dark:border-[#334155]",
              },
              {
                tier: "Bank Underwriter Suite",
                price: "$799",
                period: "per month",
                features: ["Up to 200 property searches/mo", "Advanced title & risk checks", "Priority support", "Up to 5 user licenses", "Custom reporting templates", "Tax ledger verify"],
                cta: "Choose Underwriter",
                accent: "border-[#10B981] relative",
                badge: true,
              },
              {
                tier: "Enterprise Workspace",
                price: "Custom",
                period: "annual billing",
                features: ["Unlimited property volume", "API database integrations", "Dedicated compliance manager", "Unlimited licenses", "SLA guarantees", "Custom AI threshold config"],
                cta: "Request Custom Pricing",
                accent: "border-slate-200 dark:border-[#334155]",
              },
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-2xl bg-white dark:bg-[#111827]/40 border ${plan.accent} flex flex-col justify-between space-y-6 hover:shadow-xl transition-all shadow-xs`}
              >
                {plan.badge && (
                  <span className="absolute top-0 right-8 -translate-y-1/2 bg-[#10B981] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <div className="space-y-4">
                  <h4 className="text-sm font-extrabold text-[#2563EB] dark:text-[#10B981] uppercase tracking-wider">{plan.tier}</h4>
                  <div className="flex items-baseline gap-1.5 pt-2">
                    <span className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-slate-500 dark:text-[#94A3B8] text-xs font-semibold">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 pt-4 border-t border-slate-100 dark:border-[#334155]/60 text-sm text-slate-650 dark:text-[#94A3B8]">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-[#10B981]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    if (plan.tier.includes("Enterprise")) {
                      handleScrollTo("contact");
                    } else {
                      navigate("/login");
                    }
                  }}
                  className={`w-full py-3 rounded-xl font-semibold text-sm text-center transition-colors cursor-pointer ${
                    plan.badge
                      ? "bg-[#10B981] hover:bg-[#0D9488] text-white"
                      : "bg-slate-100 hover:bg-blue-600 dark:bg-[#111827] dark:hover:bg-[#2563EB] text-slate-800 dark:text-[#94A3B8] hover:text-white border border-slate-200 dark:border-[#334155]"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Footer */}
      <footer className="border-t border-slate-200 dark:border-[#334155] bg-slate-100/80 dark:bg-[#0B1220]/90 py-16 text-left transition-colors relative z-10">
        <div className="max-w-8xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight select-none text-slate-900 dark:text-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#2563EB] to-[#10B981] flex items-center justify-center text-white shadow-md">
                <Building2 size={16} />
              </div>
              <span>
                Estate<span className="text-[#2563EB]">IQ</span>
              </span>
            </div>
            <p className="text-slate-655 dark:text-[#94A3B8] text-sm max-w-sm leading-relaxed">
              EstateIQ is an intelligent, automated property due diligence workspace engineered to streamline underwriting, title tracking, and legal investigations.
            </p>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Company</h5>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-[#94A3B8]">
              <li>
                <button onClick={() => handleScrollTo("home")} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo("features")} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  Careers
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo("solutions")} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  Press Kit
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Resources</h5>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-[#94A3B8]">
              <li>
                <button onClick={() => handleScrollTo("features")} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  Documentation
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo("how-it-works")} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  Case Studies
                </button>
              </li>
              <li>
                <button onClick={() => handleScrollTo("pricing")} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  API Docs
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Legal</h5>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-[#94A3B8]">
              <li>
                <button onClick={() => navigate("/login")} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/login")} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => navigate("/login")} className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
                  SLA Guidelines
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-8xl mx-auto px-6 lg:px-12 mt-16 pt-8 border-t border-slate-200 dark:border-[#334155]/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] gap-4">
          <p>© {new Date().getFullYear()} EstateIQ Corporation. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-900 dark:hover:text-white cursor-default">Privacy</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-default">Terms</span>
            <span className="hover:text-slate-900 dark:hover:text-white cursor-default">Cookies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
