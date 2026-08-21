package com.realestate.agent.service;

import com.realestate.agent.dto.ComparablePropertyRequest;
import com.realestate.agent.dto.ComparablePropertyResponse;

import java.util.List;

public interface MarketAnalysisService {
    ComparablePropertyResponse addComparableProperty(ComparablePropertyRequest request);
    ComparablePropertyResponse getComparablePropertyById(Long id);
    List<ComparablePropertyResponse> getComparablePropertiesForProperty(Long propertyId);
    ComparablePropertyResponse updateComparableProperty(Long id, ComparablePropertyRequest request);
    void deleteComparableProperty(Long id);
}
