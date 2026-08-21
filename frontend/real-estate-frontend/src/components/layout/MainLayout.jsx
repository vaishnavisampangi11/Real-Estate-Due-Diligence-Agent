import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import CommandPaletteModal from "../common/CommandPaletteModal";

function MainLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Persistent Collapsible Sidebar State (localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebarCollapsed");
      return saved !== null ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebarCollapsed", JSON.stringify(next));
      } catch (e) { }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-[#F8FAFC] transition-colors duration-250 flex flex-col relative">
      {/* Top Header Navbar */}
      <Navbar
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        onToggleSidebar={toggleCollapse}
        isCollapsed={isCollapsed}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* Main Content Area with Fixed Collapsible Sidebar */}
      <div className="flex flex-1">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />

        {/* Dynamic Page Container with Smooth Left Shift */}
        <main
          className={`flex-1 transition-all duration-300 ease-in-out flex flex-col justify-between px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1500px] w-full mx-auto min-h-[calc(100vh-80px)] ${isCollapsed ? "lg:pl-20" : "lg:pl-72"
            }`}
        >
          <div className="flex-1">{children}</div>
          <Footer />
        </main>
      </div>

      {/* Floating Command Palette Overlay (Ctrl + K) */}
      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}

export default MainLayout;