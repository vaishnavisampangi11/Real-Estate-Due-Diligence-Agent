import apiClient from "./apiClient";

// Get all audit logs
export const getAllAuditLogs = async () => {
  return apiClient.get("/api/audit-logs");
};

// Get audit log by ID
export const getAuditLogById = async (id) => {
  return apiClient.get(`/api/audit-logs/${id}`);
};

// Get audit logs by user ID
export const getAuditLogsByUser = async (userId) => {
  return apiClient.get(`/api/audit-logs/user/${userId}`);
};

// Get audit logs by entity (passes query parameters entityName and entityId)
export const getAuditLogsByEntity = async (entityName, entityId) => {
  return apiClient.get("/api/audit-logs/entity", {
    params: { entityName, entityId },
  });
};

// Create audit log
export const createAuditLog = async (logData) => {
  return apiClient.post("/api/audit-logs", logData);
};

// Delete audit log
export const deleteAuditLog = async (id) => {
  return apiClient.delete(`/api/audit-logs/${id}`);
};
