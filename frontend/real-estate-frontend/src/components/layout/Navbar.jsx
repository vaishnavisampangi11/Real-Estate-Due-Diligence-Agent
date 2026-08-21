import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Search,
  LogOut,
  Menu,
  Sun,
  Moon,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { showConfirmDialog, showToast } from "../../utils/swal";
import { useTheme } from "../../context/ThemeContext";

function Navbar({ onToggleMobileMenu, onToggleSidebar, isCollapsed, onOpenCommandPalette }) {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(3);

  const getUserName = () => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.firstName) return `${parsed.firstName} ${parsed.lastName || ""}`.trim();
        if (parsed.name) return parsed.name;
        if (parsed.username) return parsed.username;
      }
    } catch (e) { }
    return "Rama Charan";
  };

  const getUserRole = () => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) return parsed.role;
      }
    } catch (e) { }
    return "Buyer";
  };

  const userName = getUserName();
  const userRole = getUserRole();

  useEffect(() => {
    const updateCount = () => {
      try {
        const saved = localStorage.getItem("real_estate_notifications_read_map");
        const readMap = saved ? JSON.parse(saved) : {};
        const masterUnreadIds = ["NOTIF-101", "NOTIF-102", "NOTIF-103"];
        const count = masterUnreadIds.filter((id) => !readMap[id]).length;
        setUnreadCount(count);
      } catch (e) {
        setUnreadCount(0);
      }
    };

    updateCount();
    const interval = setInterval(updateCount, 1000);
    window.addEventListener("storage", updateCount);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  const handleLogout = async () => {
    const confirmed = await showConfirmDialog({
      title: "Logout Confirmation",
      text: "Are you sure you want to log out of your workspace?",
      confirmButtonText: "Logout Now",
      cancelButtonText: "Stay Logged In",
      icon: "question",
    });

    if (confirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      showToast("Logged out successfully", "info");
      navigate("/login");
    }
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (onOpenCommandPalette) {
      onOpenCommandPalette();
    } else if (searchQuery.trim()) {
      showToast(`Searching properties for "${searchQuery}"`, "info");
      navigate("/property-search");
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full h-20 bg-white/90 dark:bg-[#0B1120]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-[#334155] transition-colors">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left Section: Sidebar Toggle & App Brand Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle Button */}
          <button
            onClick={onToggleMobileMenu}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] lg:hidden cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={22} />
          </button>

          {/* Desktop Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors cursor-pointer"
            aria-label="Toggle Collapsible Sidebar"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Menu size={22} />
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="top-left-username text-base sm:text-lg font-extrabold text-slate-900 dark:text-[#F8FAFC] tracking-tight hover:text-blue-600 dark:hover:text-cyan-400 transition-colors">
              Real Estate Due Diligence Agent
            </div>
          </Link>
        </div>

        {/* Middle Global Search Box */}
        <form onSubmit={handleGlobalSearch} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties by Address, City, APN, or Owner..."
              className="w-full pl-10 pr-12 py-2.5 rounded-2xl bg-slate-100/80 dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] text-xs font-medium text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <div className="absolute right-3 top-2.5 px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-[#0F172A] text-[10px] font-mono font-bold text-slate-400 dark:text-slate-400 border border-slate-300/50 dark:border-[#334155]">
              <span>⌘K</span>
            </div>
          </div>
        </form>

        {/* Right User Navigation, Theme Toggle & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Light-Dark Theme Toggle Switch Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-all duration-200 cursor-pointer flex items-center justify-center border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#111827] shadow-xs"
            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun size={18} className="text-amber-400" />
            ) : (
              <Moon size={18} className="text-blue-600" />
            )}
          </button>

          {/* Notification Bell Badge Button */}
          <Link
            to="/notifications"
            className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-all border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#111827]"
            title="Notification Center"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* User Profile Pill */}
          <Link
            to="/profile"
            className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1E293B] transition-colors group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
              {userName ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) : "RC"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-800 dark:text-[#F8FAFC] group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors leading-tight">
                {userName}
              </p>
              <p className="text-[11px] font-medium text-slate-500 dark:text-[#CBD5E1]">
                {userRole}
              </p>
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;