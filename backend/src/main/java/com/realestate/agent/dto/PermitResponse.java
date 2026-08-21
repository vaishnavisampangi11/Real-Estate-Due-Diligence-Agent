package com.realestate.agent.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermitResponse {
    private Long permitId;
    private Long propertyId;
    private String propertyName;
    private String permitNumber;
    private String permitType;
    private String issuingAuthority;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String status;
    private String documentUrl;
    private String verificationStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
