import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldAlert, Home, ArrowLeft, Search } from "lucide-react";
import Button from "../components/common/Button";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background blur effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full glass-card p-8 rounded-3xl border border-slate-700/80 bg-slate-800/80 shadow-2xl text-center space-y-6 relative z-10"
      >
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-500/10 text-cyan-400 border border-blue-500/20 flex items-center justify-center">
          <ShieldAlert size={36} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            HTTP 404 Error
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The requested real estate due diligence workspace or audit route does not exist or has been relocated.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            icon={ArrowLeft}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="primary"
            icon={Home}
            className="w-full sm:w-auto"
          >
            Return to Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

export default NotFound;
