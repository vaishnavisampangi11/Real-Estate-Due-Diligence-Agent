import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MainLayout from "../components/layout/MainLayout";
import Badge from "../components/common/Badge";
import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Shield,
  Users,
  Building2,
  BarChart3,
  X,
} from "lucide-react";

// ─── MOCK DATA ──────────────────────────────────────────────

const DOCUMENTATION_ITEMS = [
  { id: "DOC-1", title: "Getting Started with Apex Due Diligence", desc: "Complete onboarding guide for new administrators, buyers, agents, and legal reviewers.", category: "Onboarding", icon: Zap },
  { id: "DOC-2", title: "Property Risk Assessment Framework", desc: "Understand the 13-vector due diligence scoring methodology used across all property audits.", category: "Risk Engine", icon: Shield },
  { id: "DOC-3", title: "User & Role Management Guide", desc: "How to create, assign, and modify RBAC roles (Admin, Buyer, Agent, Legal, Financial).", category: "Administration", icon: Users },
  { id: "DOC-4", title: "Report Generation & Export", desc: "Generate PDF/CSV audit dossiers, share reports, and configure automated report scheduling.", category: "Reports", icon: FileText },
  { id: "DOC-5", title: "Property Search & Comparable Analysis", desc: "Advanced property search filters, geolocation queries, and comparable market analysis tools.", category: "Properties", icon: Building2 },
  { id: "DOC-6", title: "Analytics Dashboard Configuration", desc: "Customize KPI widgets, chart timelines (1M/3M/6M/1Y), and export analytics telemetry.", category: "Analytics", icon: BarChart3 },
];

const FAQ_ITEMS = [
  { id: "FAQ-1", question: "How do I reset my password?", answer: "Navigate to My Account → Security tab → Change Password section. Enter your current password, set a new one (minimum 8 characters), and click 'Update Security Credentials'. You can also use the 'Forgot Password' link on the login screen to receive a reset email." },
  { id: "FAQ-2", question: "What does the Risk Score (0–100) represent?", answer: "The Risk Score is a composite index derived from 13 independent verification vectors including title chain analysis, encumbrance certificate validation, Sub-Registrar record cross-referencing, RERA compliance checks, environmental clearance status, zoning conformity, tax lien history, and court litigation scans. A score below 30 is Low Risk, 30–60 is Moderate, and above 60 is High Risk." },
  { id: "FAQ-3", question: "How do I generate a Due Diligence Report?", answer: "Go to Property Management → select a property → click 'Generate Report'. The system will compile all 13 verification vectors, attach supporting documents, and produce a certified PDF audit dossier. Reports typically generate within 30–60 seconds." },
  { id: "FAQ-4", question: "Can I assign multiple roles to one user?", answer: "Currently, each user account is assigned a single primary role (Administrator, Buyer, Real Estate Agent, Legal Reviewer, or Financial Institution). For users who need cross-functional access, we recommend creating separate accounts or contacting your administrator to customize role permissions." },
  { id: "FAQ-5", question: "How are property images stored?", answer: "All property images are uploaded to an encrypted AWS S3 bucket with server-side AES-256 encryption. Images are served via CloudFront CDN for fast global delivery. Maximum file size is 10 MB per image, supporting JPEG, PNG, and WebP formats." },
  { id: "FAQ-6", question: "What browsers are supported?", answer: "Apex Due Diligence Portal is optimized for Chrome 120+, Firefox 125+, Safari 17+, and Microsoft Edge 120+. We recommend using the latest version of any modern Chromium-based browser for the best experience." },
];

const USER_GUIDE_SECTIONS = [
  { id: "UG-1", title: "Administrator Quick Start", steps: ["Log in with admin credentials", "Navigate to Dashboard → Users to manage team members", "Configure roles under Role Management", "Set up System Monitoring alerts", "Review Audit Logs for compliance"] },
  { id: "UG-2", title: "Buyer Workflow", steps: ["Search properties using advanced filters", "Save properties to your Watchlist", "Request a Due Diligence Report", "Review risk scores and legal flags", "Download certified PDF audit dossier"] },
  { id: "UG-3", title: "Agent Property Listing", steps: ["Navigate to My Properties", "Click 'Add New Property' with full details", "Upload property images and documents", "Assign to clients for due diligence review", "Monitor property status and risk updates"] },
];

const SUPPORT_CONTACT = {
  email: "support@apex-diligence.in",
  phone: "+91 40 6789 1234",
  address: "Plot 45, Sy. No. 112/A, Financial District, Nanakramguda, Hyderabad, Telangana 500032, India",
  hours: "Monday – Saturday, 9:00 AM – 6:00 PM IST",
  responseTime: "< 4 Business Hours",
};

const RELEASE_NOTES = [
  { version: "v3.2.0", date: "05 Aug 2026", highlights: ["Security Center with failed login forensics", "Data Management export suite (CSV/PDF)", "System Monitoring with live CPU/Memory telemetry", "Notifications Center with 7 alert types"] },
  { version: "v3.1.0", date: "18 Jul 2026", highlights: ["Analytics Dashboard with 8 Recharts visualizations", "Dynamic timeline filters (1M/3M/6M/1Y)", "Audit Logs with enterprise-grade pagination", "Role Management permission matrix editor"] },
  { version: "v3.0.0", date: "01 Jul 2026", highlights: ["Complete UI redesign with glassmorphism dark theme", "5-role RBAC system (Admin, Buyer, Agent, Legal, Financial)", "13-vector property risk scoring engine", "Sub-Registrar OAuth2 integration"] },
];

// ─── COMPONENT ──────────────────────────────────────────────

function HelpSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [activeDocCategory, setActiveDocCategory] = useState("All");

  const docCategories = ["All", ...new Set(DOCUMENTATION_ITEMS.map((d) => d.category))];

  // 6. SEARCH HELP — filter across all sections
  const filteredDocs = useMemo(() => {
    let docs = DOCUMENTATION_ITEMS;
    if (activeDocCategory !== "All") docs = docs.filter((d) => d.category === activeDocCategory);
    if (searchQuery) docs = docs.filter((d) => d.title.toLowerCase().includes(searchQuery.toLowerCase()) || d.desc.toLowerCase().includes(searchQuery.toLowerCase()));
    return docs;
  }, [searchQuery, activeDocCategory]);

  const filteredFaqs = useMemo(() => {
    if (!searchQuery) return FAQ_ITEMS;
    return FAQ_ITEMS.filter((f) => f.question.toLowerCase().includes(searchQuery.toLowerCase()) || f.answer.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  return (
    <MainLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16 font-mono text-xs">
        {/* HEADER */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-bold mb-2">
                <HelpCircle size={14} /> Knowledge Base & Support Portal
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Help & Support
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Browse documentation, FAQs, user guides, release notes, and contact our enterprise support team.
              </p>
            </div>
          </div>

          {/* 6. SEARCH HELP */}
          <div className="mt-5 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search documentation, FAQs, guides, and release notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* SECTION 1: DOCUMENTATION */}
        <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen size={18} className="text-violet-500" /> 1. Documentation
            </h2>
            <Badge variant="primary">{filteredDocs.length} Articles</Badge>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {docCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveDocCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all cursor-pointer ${activeDocCategory === cat
                  ? "bg-violet-600 text-white shadow-md"
                  : "bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#334155] hover:bg-slate-200"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => {
              const IconComp = doc.icon;
              return (
                <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] hover:border-violet-400 transition-all space-y-2 group cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 shrink-0">
                      <IconComp size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{doc.title}</h3>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{doc.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] font-bold text-violet-500 uppercase">{doc.category}</span>
                    <ExternalLink size={12} className="text-slate-400 group-hover:text-violet-500 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: FAQs */}
        <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageCircle size={18} className="text-amber-500" /> 2. Frequently Asked Questions
            </h2>
            <Badge variant="warning">{filteredFaqs.length} FAQs</Badge>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="rounded-2xl border border-slate-200 dark:border-[#334155] overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full p-4 flex items-center justify-between text-left bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <span className="text-xs font-extrabold text-slate-900 dark:text-white pr-4">{faq.question}</span>
                  {expandedFaq === faq.id ? <ChevronUp size={16} className="text-amber-500 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                </button>
                <AnimatePresence>
                  {expandedFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-white dark:bg-[#1E293B] border-t border-slate-100 dark:border-[#334155]">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* 2-COLUMN: SECTION 3 (USER GUIDE) + SECTION 4 (SUPPORT CONTACT) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* SECTION 3: SYSTEM USER GUIDE */}
          <div className="lg:col-span-7 white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-emerald-500" /> 3. System User Guide
              </h2>
              <Badge variant="success">{USER_GUIDE_SECTIONS.length} Guides</Badge>
            </div>

            <div className="space-y-4">
              {USER_GUIDE_SECTIONS.map((guide) => (
                <div key={guide.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-900 dark:text-white">{guide.title}</h3>
                  <ol className="space-y-1.5">
                    {guide.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[9px] font-extrabold shrink-0 mt-0.5">{i + 1}</span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-300">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: SUPPORT CONTACT */}
          <div className="lg:col-span-5 white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Phone size={18} className="text-blue-500" /> 4. Support Contact
              </h2>
              <Badge variant="info">Live Support</Badge>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 shrink-0"><Mail size={16} /></div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Email Support</span>
                  <strong className="text-blue-600 dark:text-cyan-400 font-extrabold text-xs">{SUPPORT_CONTACT.email}</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-start gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 shrink-0"><Phone size={16} /></div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Phone Helpline</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold text-xs">{SUPPORT_CONTACT.phone}</strong>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-start gap-3">
                <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 shrink-0"><MapPin size={16} /></div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Office Address</span>
                  <strong className="text-slate-900 dark:text-white font-extrabold text-xs leading-relaxed block">{SUPPORT_CONTACT.address}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block"><Clock size={10} className="inline mr-1" />Business Hours</span>
                  <strong className="text-slate-900 dark:text-white font-bold text-[11px] block mt-0.5">{SUPPORT_CONTACT.hours}</strong>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block"><Zap size={10} className="inline mr-1" />Response SLA</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] block mt-0.5">{SUPPORT_CONTACT.responseTime}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: RELEASE NOTES */}
        <div className="white-card rounded-3xl p-6 sm:p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-[#334155] shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#334155] pb-4">
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag size={18} className="text-cyan-500" /> 5. Release Notes
            </h2>
            <Badge variant="info">{RELEASE_NOTES.length} Releases</Badge>
          </div>

          <div className="space-y-4">
            {RELEASE_NOTES.map((release, idx) => (
              <div key={release.version} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-[11px] font-extrabold">{release.version}</span>
                    {idx === 0 && <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold">LATEST</span>}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">{release.date}</span>
                </div>
                <ul className="space-y-1">
                  {release.highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default HelpSupport;
