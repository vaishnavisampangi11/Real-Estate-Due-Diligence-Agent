package com.realestate.agent.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ComparableAnalysisItem {

    private Long comparableId;

    private Long comparablePropertyId;

    private String comparablePropertyName;

    private BigDecimal comparisonPrice;

    private BigDecimal marketValueDifference;

    private Double areaDifference;

    private Double similarityScore;

    private Double distanceKm;

    private String remarks;
}