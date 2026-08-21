package com.realestate.agent.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DueDiligenceReportResponse {
    private Long reportId;
    private Long propertyId;
    private String propertyName;
    private Long generatedByUserId;
    private String generatedByUserEmail;
    private String reportName;
    private String executiveSummary;
    private BigDecimal overallRiskScore;
    private String reportStatus;
    private String pdfPath;
    private String excelPath;
    private LocalDateTime generatedAt;
    private LocalDateTime updatedAt;
}
