import React from "react";
import { Loader2 } from "lucide-react";

function Loader({ label = "Loading data...", size = "md" }) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col justify-center items-center py-12 gap-3">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
        <Loader2 className={`animate-spin text-blue-600 ${sizeMap[size] || sizeMap.md}`} />
      </div>
      {label && <p className="text-xs font-semibold text-slate-500 animate-pulse tracking-wide uppercase">{label}</p>}
    </div>
  );
}

export default Loader;