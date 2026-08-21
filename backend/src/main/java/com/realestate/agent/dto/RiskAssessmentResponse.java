package com.realestate.agent.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentResponse {
    private Long assessmentId;
    private Long propertyId;
    private String propertyName;
    private Long riskCategoryId;
    private String riskCategoryName;
    private Long assessedByUserId;
    private String assessedByUserEmail;
    private BigDecimal riskScore;
    private String riskLevel;
    private String recommendation;
    private LocalDateTime assessmentDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
