package com.realestate.agent.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PropertyValuationResponse {

    private Long propertyId;

    private String propertyName;

    private BigDecimal actualMarketValue;

    private BigDecimal estimatedMarketValue;

    private BigDecimal averageComparableValue;

    private BigDecimal highestComparableValue;

    private BigDecimal lowestComparableValue;

    private BigDecimal marketDifference;

    private Double marketDifferencePercentage;

    private Double confidenceScore;

    private String valuationStatus;

    private String recommendation;

    private LocalDateTime generatedAt;
}