package com.realestate.agent.service;

import com.realestate.agent.dto.RiskAssessmentRequest;
import com.realestate.agent.dto.RiskAssessmentResponse;
import com.realestate.agent.dto.RiskCategoryRequest;
import com.realestate.agent.dto.RiskCategoryResponse;
import com.realestate.agent.entity.Property;
import com.realestate.agent.entity.RiskAssessment;
import com.realestate.agent.entity.RiskCategory;
import com.realestate.agent.entity.User;
import com.realestate.agent.exception.DuplicateResourceException;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.RiskMapper;
import com.realestate.agent.repository.PropertyRepository;
import com.realestate.agent.repository.RiskAssessmentRepository;
import com.realestate.agent.repository.RiskCategoryRepository;
import com.realestate.agent.repository.UserRepository;
import com.realestate.agent.service.impl.RiskServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RiskServiceTest {

    @Mock
    private RiskCategoryRepository riskCategoryRepository;

    @Mock
    private RiskAssessmentRepository riskAssessmentRepository;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RiskMapper riskMapper;

    @InjectMocks
    private RiskServiceImpl riskService;

    private Property mockProperty;
    private RiskCategory mockCategory;
    private User mockUser;
    private RiskAssessment mockAssessment;
    private RiskAssessmentResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockProperty = Property.builder()
                .propertyId(1L)
                .propertyCode("PROP-001")
                .build();

        mockCategory = RiskCategory.builder()
                .riskCategoryId(10L)
                .categoryName("Legal Compliance")
                .description("Legal Compliance Category")
                .build();

        mockUser = User.builder()
                .userId(5L)
                .email("assessor@example.com")
                .build();

        mockAssessment = RiskAssessment.builder()
                .assessmentId(100L)
                .property(mockProperty)
                .riskCategory(mockCategory)
                .assessedBy(mockUser)
                .riskScore(new BigDecimal("15.00"))
                .recommendation("Clear ownership title verified")
                .build();

        mockResponse = RiskAssessmentResponse.builder()
                .assessmentId(100L)
                .propertyId(1L)
                .riskCategoryId(10L)
                .riskCategoryName("Legal Compliance")
                .riskScore(new BigDecimal("15.00"))
                .recommendation("Clear ownership title verified")
                .build();
    }

    @Test
    @DisplayName("Should successfully get risk assessments by property ID")
    void getRiskAssessmentsByProperty_Success() {
        when(propertyRepository.existsById(1L)).thenReturn(true);
        when(riskAssessmentRepository.findByPropertyPropertyId(1L)).thenReturn(List.of(mockAssessment));
        when(riskMapper.toRiskAssessmentResponse(mockAssessment)).thenReturn(mockResponse);

        List<RiskAssessmentResponse> list = riskService.getRiskAssessmentsByProperty(1L);

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals(new BigDecimal("15.00"), list.get(0).getRiskScore());
        assertEquals("Legal Compliance", list.get(0).getRiskCategoryName());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when querying risk assessment for invalid property ID")
    void getRiskAssessmentsByProperty_NotFound_ThrowsException() {
        when(propertyRepository.existsById(999L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> riskService.getRiskAssessmentsByProperty(999L));
    }

    @Test
    @DisplayName("Should create a risk category successfully")
    void createRiskCategory_Success() {
        RiskCategoryRequest request = RiskCategoryRequest.builder()
                .categoryName("Environmental Compliance")
                .build();

        RiskCategoryResponse categoryResponse = RiskCategoryResponse.builder()
                .riskCategoryId(11L)
                .categoryName("Environmental Compliance")
                .build();

        when(riskCategoryRepository.existsByCategoryName("Environmental Compliance")).thenReturn(false);
        when(riskMapper.toRiskCategoryEntity(request)).thenReturn(mockCategory);
        when(riskCategoryRepository.save(any(RiskCategory.class))).thenReturn(mockCategory);
        when(riskMapper.toRiskCategoryResponse(any(RiskCategory.class))).thenReturn(categoryResponse);

        RiskCategoryResponse response = riskService.createRiskCategory(request);

        assertNotNull(response);
        assertEquals("Environmental Compliance", response.getCategoryName());
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException on duplicate risk category name")
    void createRiskCategory_Duplicate_ThrowsException() {
        RiskCategoryRequest request = RiskCategoryRequest.builder()
                .categoryName("Legal Compliance")
                .build();

        when(riskCategoryRepository.existsByCategoryName("Legal Compliance")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> riskService.createRiskCategory(request));
    }
}
