package com.realestate.agent.service.impl;

import com.realestate.agent.dto.AuditLogRequest;
import com.realestate.agent.dto.AuditLogResponse;
import com.realestate.agent.entity.AuditLog;
import com.realestate.agent.entity.User;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.AuditLogMapper;
import com.realestate.agent.repository.AuditLogRepository;
import com.realestate.agent.repository.UserRepository;
import com.realestate.agent.service.AuditLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuditLogMapper auditLogMapper;

    public AuditLogServiceImpl(
            AuditLogRepository auditLogRepository,
            UserRepository userRepository,
            AuditLogMapper auditLogMapper
    ) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.auditLogMapper = auditLogMapper;
    }

    @Override
    @Transactional
    public AuditLogResponse createAuditLog(AuditLogRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with ID: " + request.getUserId()
                        ));

        AuditLog auditLog = auditLogMapper.toEntity(request, user);

        AuditLog savedLog = auditLogRepository.save(auditLog);

        return auditLogMapper.toResponse(savedLog);
    }

    @Override
    @Transactional(readOnly = true)
    public AuditLogResponse getAuditLogById(Long id) {

        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Audit log not found with ID: " + id
                        ));

        return auditLogMapper.toResponse(auditLog);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAllAuditLogs() {

        return auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsByUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with ID: " + userId
                        ));

        return auditLogRepository.findByUser(user)
                .stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getAuditLogsByEntity(
            String entityName,
            Long entityId
    ) {

        return auditLogRepository
                .findByEntityNameAndEntityId(entityName, entityId)
                .stream()
                .map(auditLogMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAuditLog(Long id) {

        AuditLog auditLog = auditLogRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Audit log not found with ID: " + id
                        ));

        auditLogRepository.delete(auditLog);
    }
}