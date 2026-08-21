package com.realestate.agent.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnvironmentalRecordResponse {
    private Long environmentalId;
    private Long propertyId;
    private String propertyName;
    private String recordType;
    private String riskLevel;
    private String issuingAuthority;
    private LocalDate reportDate;
    private String description;
    private String reportUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
