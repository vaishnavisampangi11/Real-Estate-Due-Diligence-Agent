import apiClient from "./apiClient";

// Get all system roles from PostgreSQL
export const getAllRoles = async () => {
  return apiClient.get("/api/admin/roles");
};

// Get role by ID
export const getRoleById = async (roleId) => {
  return apiClient.get(`/api/admin/roles/${roleId}`);
};

// Create a new role
export const createRole = async (roleData) => {
  return apiClient.post("/api/admin/roles", roleData);
};

// Update role details
export const updateRole = async (roleId, roleData) => {
  return apiClient.put(`/api/admin/roles/${roleId}`, roleData);
};

// Assign role to user
export const assignRoleToUser = async (roleId, userId) => {
  return apiClient.post(`/api/admin/roles/${roleId}/assign/${userId}`);
};

// Remove role from user
export const removeRoleFromUser = async (roleId, userId) => {
  return apiClient.delete(`/api/admin/roles/${roleId}/users/${userId}`);
};

// Delete role
export const deleteRole = async (roleId) => {
  return apiClient.delete(`/api/admin/roles/${roleId}`);
};
