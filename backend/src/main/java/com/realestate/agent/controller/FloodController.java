package com.realestate.agent.controller;

import com.realestate.agent.dto.FloodInformationRequest;
import com.realestate.agent.dto.FloodInformationResponse;
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
@RequestMapping("/api/verification/flood")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Flood Info Controller", description = "CRUD APIs for Managing Flood Risks")
public class FloodController {

    private final VerificationService verificationService;

    public FloodController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Create flood info record", description = "Creates a new flood information record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Flood record created successfully",
                    content = @Content(schema = @Schema(implementation = FloodInformationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<FloodInformationResponse> createFloodInfo(@Valid @RequestBody FloodInformationRequest request) {
        FloodInformationResponse response = verificationService.createFloodInfo(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get flood info by ID", description = "Retrieves a specific flood info record by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Flood record retrieved",
                    content = @Content(schema = @Schema(implementation = FloodInformationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Flood record not found")
    })
    public ResponseEntity<FloodInformationResponse> getFloodInfoById(@PathVariable("id") Long id) {
        FloodInformationResponse response = verificationService.getFloodInfoById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get flood info for a property", description = "Lists all flood info records associated with a specific property ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Flood records list retrieved"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<FloodInformationResponse>> getFloodInfoByProperty(@PathVariable("propertyId") Long propertyId) {
        List<FloodInformationResponse> response = verificationService.getFloodInfoByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Update flood info details", description = "Updates details of an existing flood record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Flood record updated successfully",
                    content = @Content(schema = @Schema(implementation = FloodInformationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Flood record or Property not found")
    })
    public ResponseEntity<FloodInformationResponse> updateFloodInfo(
            @PathVariable("id") Long id,
            @Valid @RequestBody FloodInformationRequest request
    ) {
        FloodInformationResponse response = verificationService.updateFloodInfo(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Delete flood info record", description = "Deletes a flood info record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Flood record deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Flood record not found")
    })
    public ResponseEntity<Void> deleteFloodInfo(@PathVariable("id") Long id) {
        verificationService.deleteFloodInfo(id);
        return ResponseEntity.noContent().build();
    }
}
