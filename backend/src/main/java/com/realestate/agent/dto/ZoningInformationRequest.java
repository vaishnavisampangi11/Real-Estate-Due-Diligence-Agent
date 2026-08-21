package com.realestate.agent.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoningInformationRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    private String zoneCode;

    private String zoneName;

    private String landUse;

    @PositiveOrZero(message = "Max building height must be positive or zero")
    private BigDecimal maxBuildingHeight;

    @PositiveOrZero(message = "Floor area ratio must be positive or zero")
    private BigDecimal floorAreaRatio;

    @Builder.Default
    private Boolean complianceStatus = true;

    private String remarks;
}
