package com.realestate.agent.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAssessmentRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotNull(message = "Risk Category ID is required")
    private Long riskCategoryId;

    @NotNull(message = "Risk score is required")
    @DecimalMin(value = "0.00", message = "Risk score must be at least 0")
    @DecimalMax(value = "100.00", message = "Risk score cannot exceed 100")
    private BigDecimal riskScore;

    @NotBlank(message = "Risk level is required")
    private String riskLevel;

    private String recommendation;

    @Builder.Default
    private LocalDateTime assessmentDate = LocalDateTime.now();
}
