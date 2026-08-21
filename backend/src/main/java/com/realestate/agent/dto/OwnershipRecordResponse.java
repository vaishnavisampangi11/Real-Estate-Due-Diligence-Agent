package com.realestate.agent.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnershipRecordResponse {
    private Long ownershipId;
    private Long propertyId;
    private String propertyName;
    private Long ownerId;
    private String ownerName;
    private BigDecimal ownershipPercentage;
    private LocalDate purchaseDate;
    private LocalDate saleDate;
    private Boolean isCurrentOwner;
    private Boolean verificationStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
