package com.realestate.agent.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentalRecordRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    private String recordType;

    private String riskLevel;

    private String issuingAuthority;

    private LocalDate reportDate;

    private String description;

    private String reportUrl;
}
