package com.realestate.agent.controller;

import com.realestate.agent.dto.ApiLogResponse;
import com.realestate.agent.dto.ApiProviderRequest;
import com.realestate.agent.dto.ApiProviderResponse;
import com.realestate.agent.service.ApiIntegrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/api-integration")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "API Integration Controller", description = "CRUD APIs for External API Providers and Logs")
public class ApiIntegrationController {

    private final ApiIntegrationService apiIntegrationService;

    public ApiIntegrationController(ApiIntegrationService apiIntegrationService) {
        this.apiIntegrationService = apiIntegrationService;
    }

    // PROVIDER ENDPOINTS
    @PostMapping("/providers")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Register API Provider", description = "Registers a new external API provider. Only Administrators can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Provider registered successfully",
                    content = @Content(schema = @Schema(implementation = ApiProviderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "409", description = "Provider name already exists")
    })
    public ResponseEntity<ApiProviderResponse> createProvider(@Valid @RequestBody ApiProviderRequest request) {
        ApiProviderResponse response = apiIntegrationService.createProvider(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/providers/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Get API Provider by ID", description = "Retrieves details of a registered API Provider. Only Administrators can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Provider details retrieved",
                    content = @Content(schema = @Schema(implementation = ApiProviderResponse.class))),
            @ApiResponse(responseCode = "404", description = "Provider not found")
    })
    public ResponseEntity<ApiProviderResponse> getProviderById(@PathVariable("id") Long id) {
        ApiProviderResponse response = apiIntegrationService.getProviderById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/providers")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Get all API Providers", description = "Lists all registered external API providers. Only Administrators can perform this action.")
    @ApiResponse(responseCode = "200", description = "Providers list retrieved")
    public ResponseEntity<List<ApiProviderResponse>> getAllProviders() {
        List<ApiProviderResponse> response = apiIntegrationService.getAllProviders();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/providers/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update API Provider details", description = "Updates settings of an existing API provider. Only Administrators can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Provider updated successfully",
                    content = @Content(schema = @Schema(implementation = ApiProviderResponse.class))),
            @ApiResponse(responseCode = "404", description = "Provider not found"),
            @ApiResponse(responseCode = "409", description = "Provider name already belongs to another record")
    })
    public ResponseEntity<ApiProviderResponse> updateProvider(
            @PathVariable("id") Long id,
            @Valid @RequestBody ApiProviderRequest request
    ) {
        ApiProviderResponse response = apiIntegrationService.updateProvider(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/providers/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Delete API Provider", description = "Removes a provider. Fails if provider is linked to existing logs. Only Administrators can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Provider deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Provider contains active logs"),
            @ApiResponse(responseCode = "404", description = "Provider not found")
    })
    public ResponseEntity<Void> deleteProvider(@PathVariable("id") Long id) {
        apiIntegrationService.deleteProvider(id);
        return ResponseEntity.noContent().build();
    }

    // LOG ENDPOINTS
    @GetMapping("/logs/provider/{providerId}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Get execution logs by provider", description = "Retrieves all API execution logs linked to a provider ID. Only Administrators can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Logs list retrieved"),
            @ApiResponse(responseCode = "404", description = "Provider not found")
    })
    public ResponseEntity<List<ApiLogResponse>> getLogsByProvider(@PathVariable("providerId") Long providerId) {
        List<ApiLogResponse> response = apiIntegrationService.getLogsByProvider(providerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/logs/property/{propertyId}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Get execution logs for a property", description = "Retrieves API logs triggered for a specific property. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Logs list retrieved"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<ApiLogResponse>> getLogsByProperty(@PathVariable("propertyId") Long propertyId) {
        List<ApiLogResponse> response = apiIntegrationService.getLogsByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/logs/failed")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Get all failed logs", description = "Retrieves a list of all failed API execution requests. Only Administrators can perform this action.")
    @ApiResponse(responseCode = "200", description = "Failed logs list retrieved")
    public ResponseEntity<List<ApiLogResponse>> getFailedLogs() {
        List<ApiLogResponse> response = apiIntegrationService.getFailedLogs();
        return ResponseEntity.ok(response);
    }

    // EXECUTION ENDPOINT
    @PostMapping("/execute")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Execute external API query", description = "Triggers an external REST call to a provider's endpoint, performing retry checks and saving logs. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "REST call executed and logged successfully",
                    content = @Content(schema = @Schema(implementation = ApiLogResponse.class))),
            @ApiResponse(responseCode = "400", description = "Provider is inactive or invalid data"),
            @ApiResponse(responseCode = "404", description = "Provider or Property not found")
    })
    public ResponseEntity<ApiLogResponse> callExternalApi(
            @RequestParam("providerId") Long providerId,
            @RequestParam(value = "propertyId", required = false) Long propertyId,
            @RequestParam("subEndpoint") String subEndpoint
    ) {
        ApiLogResponse response = apiIntegrationService.callExternalApi(providerId, propertyId, subEndpoint);
        return ResponseEntity.ok(response);
    }
}
