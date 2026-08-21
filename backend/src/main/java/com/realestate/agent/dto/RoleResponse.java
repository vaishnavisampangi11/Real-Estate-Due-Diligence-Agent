package com.realestate.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {

    private Long roleId;
    private String roleName;
    private String description;
    private Boolean isActive;
    private long userCount;
    private long activeUserCount;
    private List<String> permissions;
    private List<String> availablePermissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
