package com.realestate.agent.service.impl;

import com.realestate.agent.dto.ApiLogResponse;
import com.realestate.agent.dto.ApiProviderRequest;
import com.realestate.agent.dto.ApiProviderResponse;
import com.realestate.agent.entity.ApiLog;
import com.realestate.agent.entity.ApiProvider;
import com.realestate.agent.entity.Property;
import com.realestate.agent.exception.BadRequestException;
import com.realestate.agent.exception.DuplicateResourceException;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.ApiIntegrationMapper;
import com.realestate.agent.repository.ApiLogRepository;
import com.realestate.agent.repository.ApiProviderRepository;
import com.realestate.agent.repository.PropertyRepository;
import com.realestate.agent.service.ApiIntegrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApiIntegrationServiceImpl implements ApiIntegrationService {

    private final ApiProviderRepository providerRepository;
    private final ApiLogRepository logRepository;
    private final PropertyRepository propertyRepository;
    private final ApiIntegrationMapper mapper;

    public ApiIntegrationServiceImpl(
            ApiProviderRepository providerRepository,
            ApiLogRepository logRepository,
            PropertyRepository propertyRepository,
            ApiIntegrationMapper mapper
    ) {
        this.providerRepository = providerRepository;
        this.logRepository = logRepository;
        this.propertyRepository = propertyRepository;
        this.mapper = mapper;
    }

    // PROVIDER CRUD
    @Override
    @Transactional
    public ApiProviderResponse createProvider(ApiProviderRequest request) {
        if (providerRepository.existsByProviderName(request.getProviderName())) {
            throw new DuplicateResourceException("API Provider with name " + request.getProviderName() + " already exists.");
        }
        ApiProvider provider = mapper.toProviderEntity(request);
        return mapper.toProviderResponse(providerRepository.save(provider));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiProviderResponse getProviderById(Long id) {
        ApiProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("API Provider not found with ID: " + id));
        return mapper.toProviderResponse(provider);
    }

    @Override
    @Transactional
    public ApiProviderResponse updateProvider(Long id, ApiProviderRequest request) {
        ApiProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("API Provider not found with ID: " + id));

        if (!provider.getProviderName().equals(request.getProviderName()) &&
                providerRepository.existsByProviderName(request.getProviderName())) {
            throw new DuplicateResourceException("API Provider with name " + request.getProviderName() + " already exists.");
        }

        mapper.updateProviderFromRequest(request, provider);
        return mapper.toProviderResponse(providerRepository.save(provider));
    }

    @Override
    @Transactional
    public void deleteProvider(Long id) {
        ApiProvider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("API Provider not found with ID: " + id));
        
        List<ApiLog> logs = logRepository.findByApiProviderApiProviderIdOrderByRequestTimeDesc(id);
        if (!logs.isEmpty()) {
            throw new BadRequestException("Cannot delete API Provider as it has linked API execution logs.");
        }

        providerRepository.delete(provider);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApiProviderResponse> getAllProviders() {
        return providerRepository.findAll().stream()
                .map(mapper::toProviderResponse)
                .collect(Collectors.toList());
    }

    // LOG RETRIEVAL
    @Override
    @Transactional(readOnly = true)
    public List<ApiLogResponse> getLogsByProvider(Long providerId) {
        if (!providerRepository.existsById(providerId)) {
            throw new ResourceNotFoundException("API Provider not found with ID: " + providerId);
        }
        return logRepository.findByApiProviderApiProviderIdOrderByRequestTimeDesc(providerId).stream()
                .map(mapper::toLogResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApiLogResponse> getLogsByProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
        }
        return logRepository.findByPropertyPropertyIdOrderByRequestTimeDesc(propertyId).stream()
                .map(mapper::toLogResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApiLogResponse> getFailedLogs() {
        return logRepository.findBySuccessFalseOrderByRequestTimeDesc().stream()
                .map(mapper::toLogResponse)
                .collect(Collectors.toList());
    }

    // EXECUTE EXTERNAL API WITH RETRIES AND LOGGING
    @Override
    @Transactional
    public ApiLogResponse callExternalApi(Long providerId, Long propertyId, String subEndpoint) {
        ApiProvider provider = providerRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("API Provider not found with ID: " + providerId));

        if (!provider.getIsActive()) {
            throw new BadRequestException("API Provider is currently inactive.");
        }

        Property property = null;
        if (propertyId != null) {
            property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + propertyId));
        }

        String fullUrl = provider.getBaseUrl();
        RestClient restClient = RestClient.builder()
                .baseUrl(fullUrl)
                .build();

        int maxRetries = 3;
        int attempts = 0;
        boolean success = false;
        Integer statusCode = null;
        String responseBody = null;
        String errorMessage = null;
        long durationMs = 0;

        while (attempts < maxRetries) {
            long startTime = System.currentTimeMillis();
            try {
                attempts++;
                ResponseEntity<String> response = restClient.get()
                        .uri(subEndpoint)
                        .retrieve()
                        .toEntity(String.class);

                durationMs = System.currentTimeMillis() - startTime;
                statusCode = response.getStatusCode().value();
                responseBody = response.getBody();
                success = true;
                errorMessage = null;
                break; // Break on success
            } catch (RestClientResponseException ex) {
                durationMs = System.currentTimeMillis() - startTime;
                statusCode = ex.getStatusCode().value();
                responseBody = ex.getResponseBodyAsString();
                errorMessage = ex.getMessage();
                success = false;
            } catch (Exception ex) {
                durationMs = System.currentTimeMillis() - startTime;
                statusCode = 500;
                errorMessage = ex.getMessage();
                success = false;
            }
        }

        // Format raw response body into valid JSON structure or wrap in quotes to ensure it fits postgres jsonb
        String formattedJson = responseBody;
        if (responseBody != null) {
            String trimmed = responseBody.trim();
            if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
                // If response is plain text, convert to a clean JSON string token
                formattedJson = "\"" + trimmed.replace("\"", "\\\"") + "\"";
            }
        } else {
            formattedJson = "{}";
        }

        ApiLog apiLog = ApiLog.builder()
                .apiProvider(provider)
                .property(property)
                .endpoint(subEndpoint)
                .requestTime(LocalDateTime.now())
                .responseTimeMs((int) durationMs)
                .statusCode(statusCode)
                .success(success)
                .retryCount(attempts - 1)
                .responseBody(formattedJson)
                .errorMessage(errorMessage)
                .build();

        return mapper.toLogResponse(logRepository.save(apiLog));
    }
}
