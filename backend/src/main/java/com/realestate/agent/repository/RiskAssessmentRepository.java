package com.realestate.agent.repository;

import com.realestate.agent.entity.RiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskAssessmentRepository extends JpaRepository<RiskAssessment, Long> {
    List<RiskAssessment> findByPropertyPropertyId(Long propertyId);
    List<RiskAssessment> findByRiskCategoryRiskCategoryId(Long riskCategoryId);
    List<RiskAssessment> findByAssessedByUserId(Long userId);
}
