/**
 * Role Utility Module for Real Estate Due Diligence Agent
 * Handles role normalization, route mapping, and RBAC authorization checks.
 */

// Standard Role Enums
export const ROLES = {
  BUYER: "Buyer",
  AGENT: "Real Estate Agent",
  LEGAL: "Legal Reviewer",
  FINANCIAL: "Financial Institution",
  ADMIN: "Administrator",
};

/**
 * Normalizes user role string to one of standard key names:
 * 'buyer', 'agent', 'legal', 'financial', 'admin'
 */
export const normalizeRole = (role) => {
  if (!role || typeof role !== "string") return "buyer";
  const r = role.toLowerCase().trim();
  if (r.includes("admin")) return "admin";
  if (r.includes("agent") || r.includes("real estate")) return "agent";
  if (r.includes("legal")) return "legal";
  if (r.includes("financial")) return "financial";
  if (r.includes("buyer")) return "buyer";
  return "buyer";
};

/**
 * Returns canonical role display title
 */
export const getRoleTitle = (role) => {
  const norm = normalizeRole(role);
  switch (norm) {
    case "admin":
      return ROLES.ADMIN;
    case "agent":
      return ROLES.AGENT;
    case "legal":
      return ROLES.LEGAL;
    case "financial":
      return ROLES.FINANCIAL;
    case "buyer":
    default:
      return ROLES.BUYER;
  }
};

/**
 * Returns dashboard path for a given user role
 */
export const getRoleDashboardPath = (role) => {
  const norm = normalizeRole(role);
  switch (norm) {
    case "admin":
      return "/admin/dashboard";
    case "agent":
      return "/agent/dashboard";
    case "legal":
      return "/legal/dashboard";
    case "financial":
      return "/financial/dashboard";
    case "buyer":
    default:
      return "/buyer/dashboard";
  }
};

/**
 * Helper to get currently logged-in user role from localStorage
 */
export const getCurrentUserRole = () => {
  try {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.role) return parsed.role;
    }
  } catch (e) {}
  return ROLES.BUYER;
};

/**
 * Checks if a user's role is allowed for a list of allowed roles
 */
export const isRoleAllowed = (userRole, allowedRoles = []) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const normalizedUserRole = normalizeRole(userRole);
  const normalizedAllowedRoles = allowedRoles.map((r) => normalizeRole(r));
  return normalizedAllowedRoles.includes(normalizedUserRole);
};
