import apiClient from "./apiClient";

// Search Properties by Criteria (city, state, postalCode, propertyType, status, etc.)
export const searchProperties = async (criteria = {}) => {
  return apiClient.get("/api/properties/search", { params: criteria });
};

// Backwards-compatible alias for searchProperty
export const searchProperty = async (searchParam) => {
  if (typeof searchParam === "string") {
    return searchProperties({ city: searchParam });
  }
  return searchProperties(searchParam);
};

// Get All Properties with Pagination
export const getAllProperties = async (page = 0, size = 50) => {
  return apiClient.get("/api/properties", { params: { page, size } });
};

// Get Properties Created/Managed by Authenticated User
export const getMyProperties = async (page = 0, size = 50) => {
  return apiClient.get("/api/properties/my", { params: { page, size } });
};

// Get Property Details by ID
export const getPropertyDetails = async (id) => {
  const cleanId = typeof id === "number" ? id : parseInt((id || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/properties/${cleanId}`);
};

export const getPropertyById = getPropertyDetails;

// Create New Property
export const createProperty = async (propertyData) => {
  return apiClient.post("/api/properties", propertyData);
};

// Validate Address
export const validateAddress = async (addressId) => {
  return apiClient.post(`/api/addresses/${addressId}/validate`);
};

// Get Ownership Records for a Property
export const getOwnershipRecords = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/ownership-records/property/${cleanId}`);
};

// Owner / Client Entity Management APIs (PostgreSQL backed)
export const getAllOwners = async () => {
  return apiClient.get("/api/owners");
};

export const getOwnerById = async (id) => {
  const cleanId = typeof id === "number" ? id : parseInt((id || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/owners/${cleanId}`);
};

export const createOwner = async (ownerData) => {
  return apiClient.post("/api/owners", ownerData);
};

export const updateOwner = async (id, ownerData) => {
  const cleanId = typeof id === "number" ? id : parseInt((id || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.put(`/api/owners/${cleanId}`, ownerData);
};

export const deleteOwner = async (id) => {
  const cleanId = typeof id === "number" ? id : parseInt((id || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.delete(`/api/owners/${cleanId}`);
};

// Get Property Tax History for a Property
export const getPropertyTaxHistory = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/verification/taxes/property/${cleanId}`);
};

// Get Zoning Information for a Property
export const getZoningInformation = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/verification/zoning/property/${cleanId}`);
};

// Get Flood Zone Information for a Property
export const getFloodZoneInformation = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/verification/flood/property/${cleanId}`);
};

// Get Environmental Records for a Property
export const getEnvironmentalRecords = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/verification/environmental/property/${cleanId}`);
};

// Get Building Permit Records for a Property
export const getPermitRecords = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/verification/permits/property/${cleanId}`);
};

// Get Utilities Infrastructure Records for a Property
export const getUtilitiesInformation = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/verification/utilities/property/${cleanId}`);
};

// Record New Property Inspection Notification to Local Storage
export const recordInspectionNotification = (property) => {
  try {
    const propId = property?.propertyId || property?.numericId || property?.id || "1001";
    const cleanNumericId = propId.toString().replace(/\D/g, "") || "1001";
    const propTitle = property?.propertyName || property?.title || property?.address || `Property Parcel PR-${cleanNumericId}`;

    let userName = "Rama Charan";
    let userRole = "Buyer";
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        userName = u.firstName ? `${u.firstName} ${u.lastName || ""}`.trim() : u.name || "Rama Charan";
        userRole = u.role || "Buyer";
      }
    } catch (e) { }

    const newNotif = {
      id: `notif-inspect-${Date.now()}`,
      title: `Property Inspection Audit Initiated - ${propTitle}`,
      message: `User ${userName} (${userRole}) initiated an in-depth due diligence inspection audit for property parcel PR-${cleanNumericId}.`,
      timestamp: "Just Now",
      read: false,
      category: "TITLE",
      priority: "HIGH",
      propertyId: cleanNumericId,
    };

    const existing = JSON.parse(localStorage.getItem("user_notifications") || "[]");
    const updated = [newNotif, ...existing];
    localStorage.setItem("user_notifications", JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed to record inspection notification:", e);
  }
};

// Get User Notifications
export const getMyNotifications = async () => {
  return apiClient.get("/api/notifications");
};

// Get User Unread Notifications Count
export const getUnreadNotificationsCount = async () => {
  return apiClient.get("/api/notifications/unread-count");
};

// Get All Documents from Vault
export const getAllDocuments = async () => {
  return apiClient.get("/api/documents");
};

// Get Documents for Property
export const getPropertyDocuments = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/documents/property/${cleanId}`);
};

// Get Reports for Property
export const getReportsByProperty = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/reports/property/${cleanId}`);
};

// Get All Audit Reports
export const getAllReports = async () => {
  return apiClient.get("/api/reports");
};

// Get Reports Generated by Authenticated User
export const getMyReports = async () => {
  return apiClient.get("/api/reports/my");
};

// Get Risk Assessments for Property
export const getRiskAssessmentsByProperty = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/risk-assessments/property/${cleanId}`);
};

// Get Risk Assessments Conducted by Authenticated User
export const getMyAssessments = async () => {
  return apiClient.get("/api/risk-assessments/my");
};

// Get Comparable Properties for Property
export const getComparableProperties = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/comparable-properties/property/${cleanId}`);
};

// Get Audit Logs & Activity Feed
export const getAuditLogs = async () => {
  return apiClient.get("/api/audit-logs");
};

// Get Dashboard Statistics
export const getDashboardStats = async () => {
  return apiClient.get("/api/admin/dashboard/analytics");
};

// Get User Profile
export const getUserProfile = async () => {
  return apiClient.get("/api/user/profile");
};

// Verification APIs
export const getPropertyOwnership = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/ownership-records/property/${cleanId}`);
};

export const getPropertyTaxes = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/verification/taxes/property/${cleanId}`);
};

export const getPropertyZoning = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/verification/zoning/property/${cleanId}`);
};

export const getPropertyPermits = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/verification/permits/property/${cleanId}`);
};

export const getPropertyFlood = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/verification/flood/property/${cleanId}`);
};

export const getPropertyEnvironmental = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/verification/environmental/property/${cleanId}`);
};

export const getPropertyUtilities = async (propertyId) => {
  const cleanId = typeof propertyId === "number" ? propertyId : parseInt((propertyId || "1").toString().replace(/\D/g, "") || "1", 10);
  return apiClient.get(`/api/verification/utilities/property/${cleanId}`);
};