package com.realestate.agent.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DueDiligenceReportRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotBlank(message = "Report name is required")
    private String reportName;

    private String executiveSummary;

    @DecimalMin(value = "0.00", message = "Overall risk score must be at least 0")
    @DecimalMax(value = "100.00", message = "Overall risk score cannot exceed 100")
    private BigDecimal overallRiskScore;

    @Builder.Default
    private String reportStatus = "GENERATED";

    private String pdfPath;

    private String excelPath;
}
