package com.realestate.agent.service.impl;

import com.realestate.agent.dto.RiskAssessmentRequest;
import com.realestate.agent.dto.RiskAssessmentResponse;
import com.realestate.agent.dto.RiskCategoryRequest;
import com.realestate.agent.dto.RiskCategoryResponse;
import com.realestate.agent.entity.Property;
import com.realestate.agent.entity.RiskAssessment;
import com.realestate.agent.entity.RiskCategory;
import com.realestate.agent.entity.User;
import com.realestate.agent.exception.BadRequestException;
import com.realestate.agent.exception.DuplicateResourceException;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.RiskMapper;
import com.realestate.agent.repository.PropertyRepository;
import com.realestate.agent.repository.RiskAssessmentRepository;
import com.realestate.agent.repository.RiskCategoryRepository;
import com.realestate.agent.repository.UserRepository;
import com.realestate.agent.service.RiskService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RiskServiceImpl implements RiskService {

    private final RiskCategoryRepository riskCategoryRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final RiskMapper riskMapper;

    public RiskServiceImpl(
            RiskCategoryRepository riskCategoryRepository,
            RiskAssessmentRepository riskAssessmentRepository,
            PropertyRepository propertyRepository,
            UserRepository userRepository,
            RiskMapper riskMapper
    ) {
        this.riskCategoryRepository = riskCategoryRepository;
        this.riskAssessmentRepository = riskAssessmentRepository;
        this.propertyRepository = propertyRepository;
        this.userRepository = userRepository;
        this.riskMapper = riskMapper;
    }

    // RISK CATEGORY
    @Override
    @Transactional
    public RiskCategoryResponse createRiskCategory(RiskCategoryRequest request) {
        if (riskCategoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new DuplicateResourceException("Risk category already exists: " + request.getCategoryName());
        }
        RiskCategory category = riskMapper.toRiskCategoryEntity(request);
        return riskMapper.toRiskCategoryResponse(riskCategoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public RiskCategoryResponse getRiskCategoryById(Long id) {
        RiskCategory category = riskCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk category not found with ID: " + id));
        return riskMapper.toRiskCategoryResponse(category);
    }

    @Override
    @Transactional
    public RiskCategoryResponse updateRiskCategory(Long id, RiskCategoryRequest request) {
        RiskCategory category = riskCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk category not found with ID: " + id));

        if (!category.getCategoryName().equals(request.getCategoryName()) &&
                riskCategoryRepository.existsByCategoryName(request.getCategoryName())) {
            throw new DuplicateResourceException("Risk category with name " + request.getCategoryName() + " already exists.");
        }

        riskMapper.updateRiskCategoryFromRequest(request, category);
        return riskMapper.toRiskCategoryResponse(riskCategoryRepository.save(category));
    }

    @Override
    @Transactional
    public void deleteRiskCategory(Long id) {
        RiskCategory category = riskCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk category not found with ID: " + id));
        
        List<RiskAssessment> linkedAssessments = riskAssessmentRepository.findByRiskCategoryRiskCategoryId(id);
        if (!linkedAssessments.isEmpty()) {
            throw new BadRequestException("Cannot delete risk category as it is linked to existing property risk assessments.");
        }

        riskCategoryRepository.delete(category);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RiskCategoryResponse> getAllRiskCategories() {
        return riskCategoryRepository.findAll().stream()
                .map(riskMapper::toRiskCategoryResponse)
                .collect(Collectors.toList());
    }

    // RISK ASSESSMENT
    @Override
    @Transactional
    public RiskAssessmentResponse createRiskAssessment(RiskAssessmentRequest request, String assessorEmail) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));

        RiskCategory category = riskCategoryRepository.findById(request.getRiskCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Risk category not found with ID: " + request.getRiskCategoryId()));

        User assessor = userRepository.findByEmail(assessorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Assessor user not found with email: " + assessorEmail));

        RiskAssessment assessment = riskMapper.toRiskAssessmentEntity(request);
        assessment.setProperty(property);
        assessment.setRiskCategory(category);
        assessment.setAssessedBy(assessor);

        return riskMapper.toRiskAssessmentResponse(riskAssessmentRepository.save(assessment));
    }

    @Override
    @Transactional(readOnly = true)
    public RiskAssessmentResponse getRiskAssessmentById(Long id) {
        RiskAssessment assessment = riskAssessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk assessment not found with ID: " + id));
        return riskMapper.toRiskAssessmentResponse(assessment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RiskAssessmentResponse> getRiskAssessmentsByProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
        }
        return riskAssessmentRepository.findByPropertyPropertyId(propertyId).stream()
                .map(riskMapper::toRiskAssessmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RiskAssessmentResponse> getMyAssessments(Long currentUserId) {
        return riskAssessmentRepository.findByAssessedByUserId(currentUserId).stream()
                .map(riskMapper::toRiskAssessmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RiskAssessmentResponse updateRiskAssessment(Long id, RiskAssessmentRequest request) {
        RiskAssessment assessment = riskAssessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk assessment not found with ID: " + id));

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));

        RiskCategory category = riskCategoryRepository.findById(request.getRiskCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Risk category not found with ID: " + request.getRiskCategoryId()));

        riskMapper.updateRiskAssessmentFromRequest(request, assessment);
        assessment.setProperty(property);
        assessment.setRiskCategory(category);

        return riskMapper.toRiskAssessmentResponse(riskAssessmentRepository.save(assessment));
    }

    @Override
    @Transactional
    public void deleteRiskAssessment(Long id) {
        RiskAssessment assessment = riskAssessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Risk assessment not found with ID: " + id));
        riskAssessmentRepository.delete(assessment);
    }
}
