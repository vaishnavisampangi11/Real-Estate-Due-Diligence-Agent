package com.realestate.agent.mapper;

import com.realestate.agent.dto.AuditLogRequest;
import com.realestate.agent.dto.AuditLogResponse;
import com.realestate.agent.entity.AuditLog;
import com.realestate.agent.entity.User;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLog toEntity(AuditLogRequest request, User user) {

        return AuditLog.builder()
                .user(user)
                .action(request.getAction())
                .entityName(request.getEntityName())
                .entityId(request.getEntityId())
                .ipAddress(request.getIpAddress())
                .build();
    }

    public AuditLogResponse toResponse(AuditLog auditLog) {

        return AuditLogResponse.builder()
                .auditLogId(auditLog.getAuditLogId())
                .userId(
                        auditLog.getUser() != null
                                ? auditLog.getUser().getUserId()
                                : null
                )
                .userEmail(
                        auditLog.getUser() != null
                                ? auditLog.getUser().getEmail()
                                : null
                )
                .action(auditLog.getAction())
                .entityName(auditLog.getEntityName())
                .entityId(auditLog.getEntityId())
                .description(null)
                .ipAddress(auditLog.getIpAddress())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}