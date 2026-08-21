package com.realestate.agent.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparablePropertyRequest {

    @NotNull(message = "Primary property ID is required")
    private Long propertyId;

    @NotNull(message = "Comparable property ID is required")
    private Long comparablePropertyId;

    @PositiveOrZero(message = "Distance must be positive or zero")
    private BigDecimal distanceKm;

    @DecimalMin(value = "0.00", message = "Similarity score must be at least 0")
    @DecimalMax(value = "100.00", message = "Similarity score cannot exceed 100")
    private BigDecimal similarityScore;

    @PositiveOrZero(message = "Comparison price must be positive or zero")
    private BigDecimal comparisonPrice;

    private LocalDate comparisonDate;

    private String remarks;
}
