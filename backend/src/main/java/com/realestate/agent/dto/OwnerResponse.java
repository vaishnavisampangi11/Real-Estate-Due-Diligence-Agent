package com.realestate.agent.dto;

import com.realestate.agent.enums.OwnerType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerResponse {
    private Long ownerId;
    private String ownerName;
    private String email;
    private String phone;
    private OwnerType ownerType;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
