package com.realestate.agent.service;

import com.realestate.agent.dto.ApiLogResponse;
import com.realestate.agent.dto.ApiProviderRequest;
import com.realestate.agent.dto.ApiProviderResponse;

import java.util.List;

public interface ApiIntegrationService {

    // API Provider CRUD
    ApiProviderResponse createProvider(ApiProviderRequest request);
    ApiProviderResponse getProviderById(Long id);
    ApiProviderResponse updateProvider(Long id, ApiProviderRequest request);
    void deleteProvider(Long id);
    List<ApiProviderResponse> getAllProviders();

    // API Log Operations
    List<ApiLogResponse> getLogsByProvider(Long providerId);
    List<ApiLogResponse> getLogsByProperty(Long propertyId);
    List<ApiLogResponse> getFailedLogs();

    // Execute External REST Call (Using Spring RestClient with logging + manual retry loop)
    ApiLogResponse callExternalApi(Long providerId, Long propertyId, String subEndpoint);
}
