package com.realestate.agent.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private Long auditLogId;

    private Long userId;

    private String userEmail;

    private String action;

    private String entityName;

    private Long entityId;

    private String description;

    private String ipAddress;

    private LocalDateTime createdAt;
}