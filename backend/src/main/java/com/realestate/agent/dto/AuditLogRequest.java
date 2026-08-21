package com.realestate.agent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Action is required")
    private String action;

    @NotBlank(message = "Entity name is required")
    private String entityName;

    private Long entityId;

    private String description;

    private String ipAddress;
}