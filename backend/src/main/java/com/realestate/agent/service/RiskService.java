package com.realestate.agent.service;

import com.realestate.agent.dto.RiskAssessmentRequest;
import com.realestate.agent.dto.RiskAssessmentResponse;
import com.realestate.agent.dto.RiskCategoryRequest;
import com.realestate.agent.dto.RiskCategoryResponse;

import java.util.List;

public interface RiskService {

    // Risk Category Operations
    RiskCategoryResponse createRiskCategory(RiskCategoryRequest request);
    RiskCategoryResponse getRiskCategoryById(Long id);
    RiskCategoryResponse updateRiskCategory(Long id, RiskCategoryRequest request);
    void deleteRiskCategory(Long id);
    List<RiskCategoryResponse> getAllRiskCategories();

    RiskAssessmentResponse createRiskAssessment(RiskAssessmentRequest request, String assessorEmail);
    RiskAssessmentResponse getRiskAssessmentById(Long id);
    List<RiskAssessmentResponse> getRiskAssessmentsByProperty(Long propertyId);
    List<RiskAssessmentResponse> getMyAssessments(Long currentUserId);
    RiskAssessmentResponse updateRiskAssessment(Long id, RiskAssessmentRequest request);
    void deleteRiskAssessment(Long id);
}
