import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import Button from "../components/common/Button";
import { getCurrentUserRole, getRoleDashboardPath, getRoleTitle } from "../utils/roleUtils";

function Unauthorized() {
  const navigate = useNavigate();
  const userRole = getCurrentUserRole();
  const roleTitle = getRoleTitle(userRole);
  const userDashboardPath = getRoleDashboardPath(userRole);

  return (
    <MainLayout>
      <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full glass-card rounded-3xl p-8 sm:p-10 border border-slate-200 dark:border-[#334155] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center justify-center mx-auto shadow-sm">
            <Lock size={32} />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-mono font-bold">
              <ShieldAlert size={14} /> 403 ACCESS DENIED
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Unauthorized Access
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#CBD5E1] leading-relaxed">
              Your account is logged in as <strong className="text-slate-900 dark:text-white font-mono">{roleTitle}</strong>. You do not have permission to access this protected workspace route.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => navigate(userDashboardPath)}
              variant="primary"
              size="md"
              icon={Home}
              className="w-full sm:w-auto"
            >
              Go to {roleTitle} Dashboard
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
              size="md"
              icon={ArrowLeft}
              className="w-full sm:w-auto"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Unauthorized;
