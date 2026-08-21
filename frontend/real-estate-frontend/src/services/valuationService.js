import apiClient from "./apiClient";

// Get Property Valuation by Property ID from Spring Boot Backend
export const getPropertyValuation = async (propertyId) => {
  const cleanId = typeof propertyId === "object" ? propertyId.id || propertyId.propertyId : propertyId;
  return apiClient.get(`/api/property-valuations/${cleanId}`);
};

export const getValuationByProperty = getPropertyValuation;
