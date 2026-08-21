/**
 * Client UI State Synchronizer for Real Estate Due Diligence Agent
 * Maintains user-selected property context (active_property_id) and client-side UI bookmark preferences.
 * Real property and due diligence records are fetched directly from Spring Boot REST APIs and PostgreSQL.
 */

// Storage Keys
const KEYS = {
  PROPERTIES: "live_properties_store",
  SAVED_PROPERTIES: "live_saved_properties_store",
  AGENT_CLIENTS: "live_agent_clients_store",
  AGENT_REQUESTS: "live_agent_requests_store",
  LEGAL_REVIEWS: "live_legal_reviews_store",
  LEGAL_DOCS: "live_legal_docs_store",
  FINANCIAL_LOANS: "live_financial_loans_store",
  AUDIT_LOGS: "live_audit_logs_store",
  NOTIFICATIONS: "live_notifications_store",
  ACTIVE_PROPERTY_ID: "active_property_id",
};

// Helper: Dispatch global live update event
export const notifyLiveUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("live_data_updated"));
    window.dispatchEvent(new Event("storage"));
  }
};

// Helper: Safe LocalStorage JSON parser/getter
const getStored = (key, fallback = []) => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) { }
  return fallback;
};

// Helper: Safe LocalStorage JSON setter
const setStored = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    notifyLiveUpdate();
  } catch (e) { }
};

// --- INITIALIZERS & READERS ---
export const getLiveProperties = () => {
  return getStored(KEYS.PROPERTIES, []);
};

export const getLiveSavedProperties = () => {
  return getStored(KEYS.SAVED_PROPERTIES, []);
};

export const getLiveAgentClients = () => {
  return getStored(KEYS.AGENT_CLIENTS, []);
};

export const getLiveAgentRequests = () => {
  return getStored(KEYS.AGENT_REQUESTS, []);
};

export const getLiveLegalReviews = () => {
  return getStored(KEYS.LEGAL_REVIEWS, []);
};

export const getLiveLegalDocs = () => {
  return getStored(KEYS.LEGAL_DOCS, []);
};

export const getLiveFinancialLoans = () => {
  return getStored(KEYS.FINANCIAL_LOANS, []);
};

export const getLiveAuditLogs = () => {
  return getStored(KEYS.AUDIT_LOGS, []);
};

export const getLiveNotifications = () => {
  return getStored(KEYS.NOTIFICATIONS, []);
};

// --- ACTIVE PROPERTY CONTEXT SYNCHRONIZER ---
export const getLiveActiveProperty = (idFromUrl) => {
  let targetId = idFromUrl;

  if (!targetId && typeof window !== "undefined") {
    targetId = localStorage.getItem(KEYS.ACTIVE_PROPERTY_ID);
  }

  if (!targetId) return null;

  const rawStr = targetId.toString();
  const cleanNumeric = parseInt(rawStr.replace(/\D/g, "") || "1", 10);

  const allProps = getLiveProperties();
  const found = allProps.find(
    (p) =>
      p.propertyId === cleanNumeric ||
      p.numericId === cleanNumeric ||
      p.id === targetId ||
      p.id === `PROP-HYD-${String(cleanNumeric).padStart(3, "0")}` ||
      p.id === `PR-${cleanNumeric}`
  );

  if (found) {
    if (typeof window !== "undefined") {
      localStorage.setItem(KEYS.ACTIVE_PROPERTY_ID, String(cleanNumeric));
    }
    return found;
  }

  // Active Context ID descriptor
  const activeObj = {
    propertyId: cleanNumeric,
    numericId: cleanNumeric,
    propertyCode: `PROP-HYD-${String(cleanNumeric).padStart(3, "0")}`,
    id: `PROP-HYD-${String(cleanNumeric).padStart(3, "0")}`,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.ACTIVE_PROPERTY_ID, String(cleanNumeric));
  }

  return activeObj;
};

export const setLiveActiveProperty = (propertyOrId) => {
  if (!propertyOrId) return;
  const id = typeof propertyOrId === "object" ? (propertyOrId.propertyId || propertyOrId.numericId || propertyOrId.id) : propertyOrId;
  const cleanNumeric = typeof id === "number" ? id : parseInt((id || "1").toString().replace(/\D/g, "") || "1", 10);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.ACTIVE_PROPERTY_ID, String(cleanNumeric));
    notifyLiveUpdate();
  }
};

// Toggle Save / Unsave Property
export const toggleSaveProperty = (property) => {
  const saved = getLiveSavedProperties();
  const pid = property.numericId || property.propertyId || property.id;
  const exists = saved.some((p) => (p.numericId || p.propertyId || p.id) === pid);

  let updated;
  if (exists) {
    updated = saved.filter((p) => (p.numericId || p.propertyId || p.id) !== pid);
  } else {
    updated = [property, ...saved];
  }
  setStored(KEYS.SAVED_PROPERTIES, updated);
  return !exists;
};

// Check if Property is Saved
export const isPropertySaved = (targetId) => {
  const saved = getLiveSavedProperties();
  if (!targetId) return false;
  const cleanId = targetId.toString().replace(/\D/g, "");
  return saved.some(
    (p) =>
      p.numericId === targetId ||
      p.propertyId === targetId ||
      p.id === targetId ||
      (cleanId && (p.numericId?.toString() === cleanId || p.propertyId?.toString() === cleanId))
  );
};
