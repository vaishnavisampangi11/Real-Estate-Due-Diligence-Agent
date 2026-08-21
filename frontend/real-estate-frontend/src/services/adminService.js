import apiClient from "./apiClient";

// Get Administrative Dashboard Analytics
export const getAdminDashboardAnalytics = async () => {
  return apiClient.get("/api/admin/dashboard/analytics");
};

// Get Live System Monitoring Telemetry
export const getSystemMonitoringTelemetry = async () => {
  return apiClient.get("/api/admin/system-monitoring");
};
