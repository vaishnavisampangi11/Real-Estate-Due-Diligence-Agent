import apiClient from "./apiClient";

// Register API
export const registerUser = async (userData) => {
  return apiClient.post("/api/auth/register", userData);
};

// Login API
export const loginUser = async (loginData) => {
  return apiClient.post("/api/auth/login", loginData);
};

// Register OAuth User API
export const registerOAuthUser = async (oauthData) => {
  return apiClient.post("/api/auth/register-oauth", oauthData);
};

// Validate JWT Token
export const isTokenValid = (token) => {
  if (!token || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    if (payload && payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp < currentTime) {
        return false;
      }
    }
    return true;
  } catch (e) {
    return false;
  }
};

// Get currently logged-in user from localStorage session
export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

// Clear all session & auth data from localStorage
export const clearAuthData = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("demoUser");
  localStorage.removeItem("mockUser");
};
