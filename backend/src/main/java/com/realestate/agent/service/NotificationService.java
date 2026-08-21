package com.realestate.agent.service;

import com.realestate.agent.dto.NotificationRequest;
import com.realestate.agent.dto.NotificationResponse;

import java.util.List;

public interface NotificationService {
    NotificationResponse sendNotification(NotificationRequest request);
    NotificationResponse getNotificationById(Long id);
    List<NotificationResponse> getNotificationsForUser(String userEmail);
    List<NotificationResponse> getUnreadNotificationsForUser(String userEmail);
    long getUnreadCountForUser(String userEmail);
    NotificationResponse markAsRead(Long id);
    void markAllAsRead(String userEmail);
    void deleteNotification(Long id);
    void clearReadNotifications(String userEmail);
}
