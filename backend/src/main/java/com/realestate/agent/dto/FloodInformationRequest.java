package com.realestate.agent.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloodInformationRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    private String floodZone;

    private String floodRiskLevel;

    @Builder.Default
    private Boolean insuranceRequired = false;

    private LocalDate lastVerified;

    private String remarks;
}
