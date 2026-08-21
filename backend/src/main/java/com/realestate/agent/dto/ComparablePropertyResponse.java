package com.realestate.agent.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparablePropertyResponse {
    private Long comparableId;
    private Long propertyId;
    private String propertyName;
    private Long comparablePropertyId;
    private String comparablePropertyName;
    private BigDecimal distanceKm;
    private BigDecimal similarityScore;
    private BigDecimal comparisonPrice;
    private LocalDate comparisonDate;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
