import apiClient from "./apiClient";

// Get all registered users from PostgreSQL
export const getAllUsers = async () => {
  return apiClient.get("/api/admin/users");
};

// Get user by ID
export const getUserById = async (userId) => {
  return apiClient.get(`/api/admin/users/${userId}`);
};

// Create a new user
export const createUser = async (userData) => {
  return apiClient.post("/api/admin/users", userData);
};

// Update existing user
export const updateUser = async (userId, userData) => {
  return apiClient.put(`/api/admin/users/${userId}`, userData);
};

// Toggle user active/inactive status
export const toggleUserStatus = async (userId) => {
  return apiClient.patch(`/api/admin/users/${userId}/status`);
};

// Delete user by ID
export const deleteUser = async (userId) => {
  return apiClient.delete(`/api/admin/users/${userId}`);
};
