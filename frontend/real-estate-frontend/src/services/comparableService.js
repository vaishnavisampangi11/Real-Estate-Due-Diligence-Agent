import apiClient from "./apiClient";

// Get Comparable Property by ID
export const getComparablePropertyById = async (id) => {
  return apiClient.get(`/api/comparable-properties/${id}`);
};

// Get Comparable Properties for a Property
export const getComparablePropertiesByProperty = async (propertyId) => {
  return apiClient.get(`/api/comparable-properties/property/${propertyId}`);
};

// Get Comparable Property Analysis Summary
export const getComparableAnalysis = async (propertyId) => {
  return apiClient.get(`/api/comparable-properties/analysis/${propertyId}`);
};

// Create Comparable Property (Explicit user action)
export const createComparableProperty = async (data) => {
  return apiClient.post("/api/comparable-properties", data);
};

// Update Comparable Property
export const updateComparableProperty = async (id, data) => {
  return apiClient.put(`/api/comparable-properties/${id}`, data);
};

// Delete Comparable Property
export const deleteComparableProperty = async (id) => {
  return apiClient.delete(`/api/comparable-properties/${id}`);
};
