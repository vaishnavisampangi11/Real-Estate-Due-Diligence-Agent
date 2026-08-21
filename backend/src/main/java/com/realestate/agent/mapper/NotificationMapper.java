package com.realestate.agent.mapper;

import com.realestate.agent.dto.NotificationResponse;
import com.realestate.agent.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationResponse toResponse(Notification notification) {
        if (notification == null) {
            return null;
        }
        return NotificationResponse.builder()
                .notificationId(notification.getNotificationId())
                .userId(notification.getUser() != null ? notification.getUser().getUserId() : null)
                .userEmail(notification.getUser() != null ? notification.getUser().getEmail() : null)
                .propertyId(notification.getProperty() != null ? notification.getProperty().getPropertyId() : null)
                .propertyName(notification.getProperty() != null ? notification.getProperty().getPropertyName() : null)
                .reportId(notification.getReport() != null ? notification.getReport().getReportId() : null)
                .reportName(notification.getReport() != null ? notification.getReport().getReportName() : null)
                .notificationType(notification.getNotificationType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .sentAt(notification.getSentAt())
                .build();
    }
}
