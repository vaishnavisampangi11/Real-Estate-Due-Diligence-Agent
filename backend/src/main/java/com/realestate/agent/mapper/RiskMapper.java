package com.realestate.agent.mapper;

import com.realestate.agent.dto.RiskAssessmentRequest;
import com.realestate.agent.dto.RiskAssessmentResponse;
import com.realestate.agent.dto.RiskCategoryRequest;
import com.realestate.agent.dto.RiskCategoryResponse;
import com.realestate.agent.entity.RiskAssessment;
import com.realestate.agent.entity.RiskCategory;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class RiskMapper {

    public RiskCategoryResponse toRiskCategoryResponse(RiskCategory category) {
        if (category == null) {
            return null;
        }
        return RiskCategoryResponse.builder()
                .riskCategoryId(category.getRiskCategoryId())
                .categoryName(category.getCategoryName())
                .description(category.getDescription())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }

    public RiskCategory toRiskCategoryEntity(RiskCategoryRequest request) {
        if (request == null) {
            return null;
        }
        return RiskCategory.builder()
                .categoryName(request.getCategoryName())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
    }

    public void updateRiskCategoryFromRequest(RiskCategoryRequest request, RiskCategory category) {
        if (request == null || category == null) {
            return;
        }
        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
    }

    public RiskAssessmentResponse toRiskAssessmentResponse(RiskAssessment assessment) {
        if (assessment == null) {
            return null;
        }
        return RiskAssessmentResponse.builder()
                .assessmentId(assessment.getAssessmentId())
                .propertyId(assessment.getProperty() != null ? assessment.getProperty().getPropertyId() : null)
                .propertyName(assessment.getProperty() != null ? assessment.getProperty().getPropertyName() : null)
                .riskCategoryId(assessment.getRiskCategory() != null ? assessment.getRiskCategory().getRiskCategoryId() : null)
                .riskCategoryName(assessment.getRiskCategory() != null ? assessment.getRiskCategory().getCategoryName() : null)
                .assessedByUserId(assessment.getAssessedBy() != null ? assessment.getAssessedBy().getUserId() : null)
                .assessedByUserEmail(assessment.getAssessedBy() != null ? assessment.getAssessedBy().getEmail() : null)
                .riskScore(assessment.getRiskScore())
                .riskLevel(assessment.getRiskLevel())
                .recommendation(assessment.getRecommendation())
                .assessmentDate(assessment.getAssessmentDate())
                .createdAt(assessment.getCreatedAt())
                .updatedAt(assessment.getUpdatedAt())
                .build();
    }

    public RiskAssessment toRiskAssessmentEntity(RiskAssessmentRequest request) {
        if (request == null) {
            return null;
        }
        return RiskAssessment.builder()
                .riskScore(request.getRiskScore())
                .riskLevel(request.getRiskLevel())
                .recommendation(request.getRecommendation())
                .assessmentDate(request.getAssessmentDate() != null ? request.getAssessmentDate() : LocalDateTime.now())
                .build();
    }

    public void updateRiskAssessmentFromRequest(RiskAssessmentRequest request, RiskAssessment assessment) {
        if (request == null || assessment == null) {
            return;
        }
        assessment.setRiskScore(request.getRiskScore());
        assessment.setRiskLevel(request.getRiskLevel());
        assessment.setRecommendation(request.getRecommendation());
        if (request.getAssessmentDate() != null) {
            assessment.setAssessmentDate(request.getAssessmentDate());
        }
    }
}
