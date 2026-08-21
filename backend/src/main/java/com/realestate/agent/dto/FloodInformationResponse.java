package com.realestate.agent.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloodInformationResponse {
    private Long floodId;
    private Long propertyId;
    private String propertyName;
    private String floodZone;
    private String floodRiskLevel;
    private Boolean insuranceRequired;
    private LocalDate lastVerified;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
