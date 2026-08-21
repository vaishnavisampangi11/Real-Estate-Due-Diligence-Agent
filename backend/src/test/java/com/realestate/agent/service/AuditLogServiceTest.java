package com.realestate.agent.service;

import com.realestate.agent.dto.AuditLogRequest;
import com.realestate.agent.dto.AuditLogResponse;
import com.realestate.agent.entity.AuditLog;
import com.realestate.agent.entity.User;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.AuditLogMapper;
import com.realestate.agent.repository.AuditLogRepository;
import com.realestate.agent.repository.UserRepository;
import com.realestate.agent.service.impl.AuditLogServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogMapper auditLogMapper;

    @InjectMocks
    private AuditLogServiceImpl auditLogService;

    private User mockUser;
    private AuditLog mockAuditLog;
    private AuditLogResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .userId(1L)
                .email("admin@example.com")
                .firstName("Super")
                .lastName("Admin")
                .build();

        mockAuditLog = AuditLog.builder()
                .auditLogId(200L)
                .user(mockUser)
                .action("REGISTER_PROPERTY")
                .entityName("Property")
                .entityId(10L)
                .build();

        mockResponse = AuditLogResponse.builder()
                .auditLogId(200L)
                .userId(1L)
                .userEmail("admin@example.com")
                .action("REGISTER_PROPERTY")
                .entityName("Property")
                .entityId(10L)
                .build();
    }

    @Test
    @DisplayName("Should successfully create audit log")
    void createAuditLog_Success() {
        AuditLogRequest request = AuditLogRequest.builder()
                .userId(1L)
                .action("REGISTER_PROPERTY")
                .entityName("Property")
                .entityId(10L)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(auditLogMapper.toEntity(request, mockUser)).thenReturn(mockAuditLog);
        when(auditLogRepository.save(mockAuditLog)).thenReturn(mockAuditLog);
        when(auditLogMapper.toResponse(mockAuditLog)).thenReturn(mockResponse);

        AuditLogResponse response = auditLogService.createAuditLog(request);

        assertNotNull(response);
        assertEquals(200L, response.getAuditLogId());
        assertEquals("REGISTER_PROPERTY", response.getAction());
        verify(auditLogRepository, times(1)).save(mockAuditLog);
    }

    @Test
    @DisplayName("Should retrieve audit logs by user ID")
    void getAuditLogsByUser_Success() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(auditLogRepository.findByUser(mockUser)).thenReturn(List.of(mockAuditLog));
        when(auditLogMapper.toResponse(mockAuditLog)).thenReturn(mockResponse);

        List<AuditLogResponse> logs = auditLogService.getAuditLogsByUser(1L);

        assertNotNull(logs);
        assertEquals(1, logs.size());
        assertEquals("REGISTER_PROPERTY", logs.get(0).getAction());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when audit log ID does not exist")
    void getAuditLogById_NotFound_ThrowsException() {
        when(auditLogRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> auditLogService.getAuditLogById(999L));
    }
}
