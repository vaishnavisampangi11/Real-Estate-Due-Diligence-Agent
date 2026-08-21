package com.realestate.agent.mapper;

import com.realestate.agent.dto.ApiLogResponse;
import com.realestate.agent.dto.ApiProviderRequest;
import com.realestate.agent.dto.ApiProviderResponse;
import com.realestate.agent.entity.ApiLog;
import com.realestate.agent.entity.ApiProvider;
import org.springframework.stereotype.Component;

@Component
public class ApiIntegrationMapper {

    public ApiProviderResponse toProviderResponse(ApiProvider provider) {
        if (provider == null) {
            return null;
        }
        return ApiProviderResponse.builder()
                .apiProviderId(provider.getApiProviderId())
                .providerName(provider.getProviderName())
                .baseUrl(provider.getBaseUrl())
                .authenticationType(provider.getAuthenticationType())
                .isActive(provider.getIsActive())
                .createdAt(provider.getCreatedAt())
                .updatedAt(provider.getUpdatedAt())
                .build();
    }

    public ApiProvider toProviderEntity(ApiProviderRequest request) {
        if (request == null) {
            return null;
        }
        return ApiProvider.builder()
                .providerName(request.getProviderName())
                .baseUrl(request.getBaseUrl())
                .authenticationType(request.getAuthenticationType())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();
    }

    public void updateProviderFromRequest(ApiProviderRequest request, ApiProvider provider) {
        if (request == null || provider == null) {
            return;
        }
        provider.setProviderName(request.getProviderName());
        provider.setBaseUrl(request.getBaseUrl());
        provider.setAuthenticationType(request.getAuthenticationType());
        if (request.getIsActive() != null) {
            provider.setIsActive(request.getIsActive());
        }
    }

    public ApiLogResponse toLogResponse(ApiLog log) {
        if (log == null) {
            return null;
        }
        return ApiLogResponse.builder()
                .apiLogId(log.getApiLogId())
                .apiProviderId(log.getApiProvider() != null ? log.getApiProvider().getApiProviderId() : null)
                .apiProviderName(log.getApiProvider() != null ? log.getApiProvider().getProviderName() : null)
                .propertyId(log.getProperty() != null ? log.getProperty().getPropertyId() : null)
                .propertyName(log.getProperty() != null ? log.getProperty().getPropertyName() : null)
                .endpoint(log.getEndpoint())
                .requestTime(log.getRequestTime())
                .responseTimeMs(log.getResponseTimeMs())
                .statusCode(log.getStatusCode())
                .success(log.getSuccess())
                .retryCount(log.getRetryCount())
                .responseBody(log.getResponseBody())
                .errorMessage(log.getErrorMessage())
                .build();
    }
}
