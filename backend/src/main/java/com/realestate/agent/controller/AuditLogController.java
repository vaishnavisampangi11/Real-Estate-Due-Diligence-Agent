package com.realestate.agent.controller;

import com.realestate.agent.dto.AuditLogRequest;
import com.realestate.agent.dto.AuditLogResponse;
import com.realestate.agent.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/audit-logs")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMINISTRATOR')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @PostMapping
    @Operation(summary = "Create audit log")
    public ResponseEntity<AuditLogResponse> createAuditLog(
            @Valid @RequestBody AuditLogRequest request
    ) {

        AuditLogResponse response =
                auditLogService.createAuditLog(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED
        );
    }

    @GetMapping
    @Operation(summary = "Get all audit logs")
    public ResponseEntity<List<AuditLogResponse>> getAllAuditLogs() {

        return ResponseEntity.ok(
                auditLogService.getAllAuditLogs()
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get audit log by ID")
    public ResponseEntity<AuditLogResponse> getAuditLogById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                auditLogService.getAuditLogById(id)
        );
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get audit logs by user")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogsByUser(
            @PathVariable Long userId
    ) {

        return ResponseEntity.ok(
                auditLogService.getAuditLogsByUser(userId)
        );
    }

    @GetMapping("/entity")
    @Operation(summary = "Get audit logs by entity")
    public ResponseEntity<List<AuditLogResponse>> getAuditLogsByEntity(
            @RequestParam String entityName,
            @RequestParam Long entityId
    ) {

        return ResponseEntity.ok(
                auditLogService.getAuditLogsByEntity(
                        entityName,
                        entityId
                )
        );
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete audit log")
    public ResponseEntity<Void> deleteAuditLog(
            @PathVariable Long id
    ) {

        auditLogService.deleteAuditLog(id);

        return ResponseEntity.noContent().build();
    }
}