package com.realestate.agent.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long notificationId;
    private Long userId;
    private String userEmail;
    private Long propertyId;
    private String propertyName;
    private Long reportId;
    private String reportName;
    private String notificationType;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime sentAt;
}
