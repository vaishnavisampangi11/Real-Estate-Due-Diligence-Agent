package com.realestate.agent.controller;

import com.realestate.agent.dto.UtilityInformationRequest;
import com.realestate.agent.dto.UtilityInformationResponse;
import com.realestate.agent.service.VerificationService;
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
@RequestMapping("/api/verification/utilities")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Utility Controller", description = "CRUD APIs for Managing Utility Connections")
public class UtilityController {

    private final VerificationService verificationService;

    public UtilityController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Create utility info record", description = "Creates a new utility connection record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Utility record created successfully",
                    content = @Content(schema = @Schema(implementation = UtilityInformationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<UtilityInformationResponse> createUtilityInfo(@Valid @RequestBody UtilityInformationRequest request) {
        UtilityInformationResponse response = verificationService.createUtilityInfo(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get utility info by ID", description = "Retrieves details of a utility connection record by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utility record retrieved",
                    content = @Content(schema = @Schema(implementation = UtilityInformationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Utility record not found")
    })
    public ResponseEntity<UtilityInformationResponse> getUtilityInfoById(@PathVariable("id") Long id) {
        UtilityInformationResponse response = verificationService.getUtilityInfoById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get utility info for a property", description = "Lists all utility records associated with a specific property ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utility records list retrieved"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<UtilityInformationResponse>> getUtilityInfoByProperty(@PathVariable("propertyId") Long propertyId) {
        List<UtilityInformationResponse> response = verificationService.getUtilityInfoByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Update utility info details", description = "Updates details of an existing utility connection record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utility record updated successfully",
                    content = @Content(schema = @Schema(implementation = UtilityInformationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Utility record or Property not found")
    })
    public ResponseEntity<UtilityInformationResponse> updateUtilityInfo(
            @PathVariable("id") Long id,
            @Valid @RequestBody UtilityInformationRequest request
    ) {
        UtilityInformationResponse response = verificationService.updateUtilityInfo(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Delete utility record", description = "Deletes a utility connection record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Utility record deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Utility record not found")
    })
    public ResponseEntity<Void> deleteUtilityInfo(@PathVariable("id") Long id) {
        verificationService.deleteUtilityInfo(id);
        return ResponseEntity.noContent().build();
    }
}
