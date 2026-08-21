package com.realestate.agent.service;

import com.realestate.agent.dto.ComparablePropertyRequest;
import com.realestate.agent.dto.ComparablePropertyResponse;

import com.realestate.agent.dto.ComparablePropertyAnalysisResponse;

import java.util.List;

public interface ComparablePropertyService {

    ComparablePropertyResponse createComparableProperty(ComparablePropertyRequest request);

    ComparablePropertyResponse getComparablePropertyById(Long id);

    List<ComparablePropertyResponse> getComparablePropertiesByProperty(Long propertyId);

    ComparablePropertyResponse updateComparableProperty(Long id, ComparablePropertyRequest request);

    void deleteComparableProperty(Long id);

    ComparablePropertyAnalysisResponse analyzeComparableProperty(Long propertyId);
}