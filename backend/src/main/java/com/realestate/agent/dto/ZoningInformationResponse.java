package com.realestate.agent.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoningInformationResponse {
    private Long zoningId;
    private Long propertyId;
    private String propertyName;
    private String zoneCode;
    private String zoneName;
    private String landUse;
    private BigDecimal maxBuildingHeight;
    private BigDecimal floorAreaRatio;
    private Boolean complianceStatus;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
