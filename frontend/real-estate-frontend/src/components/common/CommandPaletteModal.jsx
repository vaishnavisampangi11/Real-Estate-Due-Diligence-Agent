import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Building2,
  FileText,
  ShieldAlert,
  User,
  Bell,
  X,
  ArrowRight,
  Sparkles,
  Command,
} from "lucide-react";

function CommandPaletteModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          setQuery("");
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items = [
    { id: "p1", title: "Gachibowli Tech Park Phase 2, Financial District, Hyderabad", category: "Property", path: "/property-details?id=1001", icon: Building2 },
    { id: "p2", title: "Whitefield Outer Ring Road Tech Hub, Bengaluru", category: "Property", path: "/property-details?id=1003", icon: Building2 },
    { id: "p3", title: "Bandra Kurla Complex Corporate Tower, BKC Mumbai", category: "Property", path: "/property-details?id=1004", icon: Building2 },
    { id: "r1", title: "Risk Assessment Matrix & Scores", category: "Reports", path: "/risk-assessment", icon: ShieldAlert },
    { id: "r2", title: "Full Property Due Diligence Report", category: "Reports", path: "/due-diligence-report", icon: FileText },
    { id: "r3", title: "Comparable Property Valuation Analysis", category: "Reports", path: "/comparable-properties", icon: Sparkles },
    { id: "g1", title: "Property Search & Intelligence", category: "Navigation", path: "/property-search", icon: Search },
    { id: "g2", title: "Notifications & Alerts Center", category: "Navigation", path: "/notifications", icon: Bell },
    { id: "g3", title: "Auditor Profile & Account Security", category: "Navigation", path: "/profile", icon: User },
    { id: "g4", title: "Report History & Documents", category: "Navigation", path: "/report-history", icon: FileText },
  ];

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-2xl glass-card rounded-3xl border border-slate-200 dark:border-[#334155] shadow-2xl overflow-hidden bg-white dark:bg-[#1E293B]"
        >
          {/* Input Box Header */}
          <div className="p-4 border-b border-slate-200 dark:border-[#334155] flex items-center gap-3">
            <Search className="text-slate-400 dark:text-cyan-400 shrink-0" size={20} />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to search properties, reports, pages, or actions... (Esc to close)"
              className="w-full bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none text-sm font-medium"
            />
            <div className="flex items-center gap-1">
              <span className="px-2 py-1 rounded bg-slate-100 dark:bg-[#0F172A] text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[#334155]">
                ESC
              </span>
              <button
                onClick={onClose}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                No matching results found for "{query}"
              </div>
            ) : (
              filteredItems.map((item) => {
                const IconC = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.path)}
                    className="w-full p-3 rounded-2xl flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-[#0F172A] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-[#0F172A] text-blue-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                        <IconC size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                          {item.title}
                        </p>
                        <span className="text-[10px] font-mono font-bold uppercase text-slate-400 dark:text-slate-500">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div className="p-3 bg-slate-50 dark:bg-[#0F172A] border-t border-slate-200 dark:border-[#334155] flex items-center justify-between text-[11px] font-medium text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Command size={12} /> Press <kbd className="font-mono font-bold text-slate-700 dark:text-slate-300">Ctrl + K</kbd> to toggle anytime
            </span>
            <span>Enterprise Search Engine</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CommandPaletteModal;
