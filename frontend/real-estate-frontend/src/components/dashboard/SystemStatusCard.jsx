import React from "react";
import { Activity, Server, Database, Lock, Globe, RefreshCw, Cpu } from "lucide-react";

function SystemStatusCard() {
  const services = [
    { name: "API Status", status: "Operational (200 OK)", detail: "14ms avg lat", icon: Server, color: "text-emerald-500" },
    { name: "Database Status", status: "Connected", detail: "PostgreSQL active", icon: Database, color: "text-emerald-500" },
    { name: "Authentication Status", status: "Active (JWT)", detail: "Bearer token verified", icon: Lock, color: "text-emerald-500" },
    { name: "External Integrations", status: "3 Registries Live", detail: "FEMA, Tax, Zoning", icon: Globe, color: "text-emerald-500" },
    { name: "Last Sync Time", status: "Just now", detail: "Real-time socket", icon: RefreshCw, color: "text-blue-500" },
    { name: "Cache Status", status: "Hot (98.4% hit)", detail: "Redis memory clear", icon: Cpu, color: "text-purple-500" },
  ];

  return (
    <div className="glass-card rounded-3xl p-6 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-[#334155] shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#334155]">
        <div className="flex items-center gap-2">
          <Activity size={18} className="text-emerald-500 animate-pulse" />
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            System Health & Telemetry Panel
          </h3>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          All Operational
        </span>
      </div>

      <div className="space-y-2">
        {services.map((srv, idx) => {
          const IconC = srv.icon;
          return (
            <div
              key={idx}
              className="p-2.5 rounded-2xl bg-slate-50/70 dark:bg-[#0F172A]/70 border border-slate-200/60 dark:border-[#334155] flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <IconC size={14} className="text-blue-600 dark:text-cyan-400 shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white">
                    {srv.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {srv.detail}
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                {srv.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SystemStatusCard;

