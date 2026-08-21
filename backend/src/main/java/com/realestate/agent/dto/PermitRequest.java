package com.realestate.agent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermitRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotBlank(message = "Permit number is required")
    private String permitNumber;

    private String permitType;

    private String issuingAuthority;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    private String status;

    private String documentUrl;

    private String verificationStatus;
}
