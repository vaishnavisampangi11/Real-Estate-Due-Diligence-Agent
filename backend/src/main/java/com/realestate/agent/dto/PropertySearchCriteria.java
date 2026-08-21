package com.realestate.agent.dto;

import com.realestate.agent.enums.PropertyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertySearchCriteria {

    private String keyword;
    private String query;
    private String propertyName;
    private String city;
    private String state;
    private String postalCode;
    private String propertyType;
    private PropertyStatus status;
    private BigDecimal minMarketValue;
    private BigDecimal maxMarketValue;
    private Integer builtYear;

    @Builder.Default
    private Integer page = 0;

    @Builder.Default
    private Integer size = 10;

    @Builder.Default
    private String sortBy = "createdAt";

    @Builder.Default
    private String sortDirection = "DESC";
}
