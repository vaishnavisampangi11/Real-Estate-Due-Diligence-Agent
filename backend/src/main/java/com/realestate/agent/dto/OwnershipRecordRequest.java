package com.realestate.agent.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnershipRecordRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotNull(message = "Owner ID is required")
    private Long ownerId;

    @NotNull(message = "Ownership percentage is required")
    @DecimalMin(value = "0.01", message = "Ownership percentage must be greater than 0")
    @DecimalMax(value = "100.00", message = "Ownership percentage cannot exceed 100")
    private BigDecimal ownershipPercentage;

    private LocalDate purchaseDate;

    private LocalDate saleDate;

    @Builder.Default
    private Boolean isCurrentOwner = true;

    @Builder.Default
    private Boolean verificationStatus = false;
}
