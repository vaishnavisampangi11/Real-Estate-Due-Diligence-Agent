package com.realestate.agent.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ComparablePropertyAnalysisResponse {

    private Long propertyId;

    private String propertyName;

    private BigDecimal propertyMarketValue;

    private BigDecimal averageComparableValue;

    private BigDecimal highestComparableValue;

    private BigDecimal lowestComparableValue;

    private BigDecimal estimatedMarketValue;

    private Integer totalComparableProperties;

    private List<ComparableAnalysisItem> comparableProperties;

    private String analysisSummary;
}