import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getRoleDashboardPath } from "../utils/roleUtils";
import { showErrorAlert, showToast } from "../utils/swal";
import { Loader2 } from "lucide-react";

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      try {
        localStorage.setItem("token", token);
        
        // Parse token JWT claims to obtain authenticated user and role
        const payloadBase64 = token.split(".")[1];
        if (payloadBase64) {
          const payloadJson = atob(payloadBase64.replace(/-/g, "+").replace(/_/g, "/"));
          const claims = JSON.parse(payloadJson);
          const rawRole = claims.role || claims.authorities?.[0] || "ROLE_BUYER";
          const normalizedRole = rawRole.replace(/^ROLE_/, "").replace(/_/g, " ").toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase());
          
          const userObj = {
            email: claims.sub || claims.email,
            role: normalizedRole,
            token,
          };
          localStorage.setItem("user", JSON.stringify(userObj));
          localStorage.setItem("role", normalizedRole);
          
          showToast(`Welcome! Signed in via SSO as ${normalizedRole}`, "success");
          navigate(getRoleDashboardPath(normalizedRole), { replace: true });
          return;
        }
      } catch (err) {
        console.error("Failed to parse SSO JWT token:", err);
      }
      
      showToast("Signed in via SSO successfully", "success");
      navigate("/buyer/dashboard", { replace: true });
    } else if (error) {
      showErrorAlert("SSO Authentication Failed", error || "Unable to authenticate with the chosen provider.");
      navigate("/login", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0B0F17] text-slate-800 dark:text-slate-200">
      <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
      <h3 className="text-lg font-bold">Authenticating Single Sign-On...</h3>
      <p className="text-xs text-slate-500 mt-1">Completing secure provider handshake...</p>
    </div>
  );
}
