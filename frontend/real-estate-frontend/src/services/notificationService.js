import apiClient from "./apiClient";

// Get user notifications
export const getMyNotifications = async () => {
  return apiClient.get("/api/notifications");
};

// Get user unread notifications
export const getMyUnreadNotifications = async () => {
  return apiClient.get("/api/notifications/unread");
};

// Get user unread notifications count
export const getMyUnreadCount = async () => {
  return apiClient.get("/api/notifications/unread-count");
};

// Mark single notification as read
export const markNotificationAsRead = async (id) => {
  return apiClient.put(`/api/notifications/${id}/read`);
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  return apiClient.put("/api/notifications/read-all");
};

// Send Notification
export const sendNotification = async (notificationData) => {
  return apiClient.post("/api/notifications", notificationData);
};

// Delete single notification by ID
export const deleteNotification = async (id) => {
  return apiClient.delete(`/api/notifications/${id}`);
};

// Clear all read notifications
export const clearReadNotifications = async () => {
  return apiClient.delete("/api/notifications/read");
};
