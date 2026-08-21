package com.realestate.agent.service;

import com.realestate.agent.dto.AuditLogRequest;
import com.realestate.agent.dto.AuditLogResponse;

import java.util.List;

public interface AuditLogService {

    AuditLogResponse createAuditLog(AuditLogRequest request);

    AuditLogResponse getAuditLogById(Long id);

    List<AuditLogResponse> getAllAuditLogs();

    List<AuditLogResponse> getAuditLogsByUser(Long userId);

    List<AuditLogResponse> getAuditLogsByEntity(
            String entityName,
            Long entityId
    );

    void deleteAuditLog(Long id);
}