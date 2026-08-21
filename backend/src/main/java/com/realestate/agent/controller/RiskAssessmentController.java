package com.realestate.agent.controller;

import com.realestate.agent.dto.RiskAssessmentRequest;
import com.realestate.agent.dto.RiskAssessmentResponse;
import com.realestate.agent.security.CustomUserDetails;
import com.realestate.agent.service.RiskService;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/risk-assessments")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Risk Assessment Controller", description = "CRUD APIs for Managing Property Risk Assessments")
public class RiskAssessmentController {

    private final RiskService riskService;

    public RiskAssessmentController(RiskService riskService) {
        this.riskService = riskService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'LEGAL_REVIEWER', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Perform risk assessment", description = "Creates a new property risk assessment. Only Administrators, Legal Reviewers, and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Risk assessment created successfully",
                    content = @Content(schema = @Schema(implementation = RiskAssessmentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Property, Risk Category or Assessor not found")
    })
    public ResponseEntity<RiskAssessmentResponse> createRiskAssessment(
            @Valid @RequestBody RiskAssessmentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        RiskAssessmentResponse response = riskService.createRiskAssessment(request, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get risk assessment by ID", description = "Retrieves details of a specific risk assessment by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Assessment details retrieved",
                    content = @Content(schema = @Schema(implementation = RiskAssessmentResponse.class))),
            @ApiResponse(responseCode = "404", description = "Risk assessment not found")
    })
    public ResponseEntity<RiskAssessmentResponse> getRiskAssessmentById(@PathVariable("id") Long id) {
        RiskAssessmentResponse response = riskService.getRiskAssessmentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get risk assessments for a property", description = "Lists all risk assessments associated with a specific property ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Property risk assessments list retrieved"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<RiskAssessmentResponse>> getRiskAssessmentsByProperty(
            @PathVariable("propertyId") Long propertyId
    ) {
        List<RiskAssessmentResponse> response = riskService.getRiskAssessmentsByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @Operation(summary = "Get risk assessments conducted by authenticated user", description = "Lists all risk assessments performed by the currently logged-in reviewer.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User risk assessments retrieved")
    })
    public ResponseEntity<List<RiskAssessmentResponse>> getMyAssessments(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<RiskAssessmentResponse> response = riskService.getMyAssessments(userDetails.getUserId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'LEGAL_REVIEWER', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Update risk assessment", description = "Updates details of an existing risk assessment. Only Administrators, Legal Reviewers, and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Risk assessment updated successfully",
                    content = @Content(schema = @Schema(implementation = RiskAssessmentResponse.class))),
            @ApiResponse(responseCode = "404", description = "Risk assessment, property, or risk category not found")
    })
    public ResponseEntity<RiskAssessmentResponse> updateRiskAssessment(
            @PathVariable("id") Long id,
            @Valid @RequestBody RiskAssessmentRequest request
    ) {
        RiskAssessmentResponse response = riskService.updateRiskAssessment(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'LEGAL_REVIEWER', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Delete risk assessment", description = "Deletes a risk assessment. Only Administrators, Legal Reviewers, and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Risk assessment deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Risk assessment not found")
    })
    public ResponseEntity<Void> deleteRiskAssessment(@PathVariable("id") Long id) {
        riskService.deleteRiskAssessment(id);
        return ResponseEntity.noContent().build();
    }
}
