package com.realestate.agent.controller;

import com.realestate.agent.dto.ZoningInformationRequest;
import com.realestate.agent.dto.ZoningInformationResponse;
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
@RequestMapping("/api/verification/zoning")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Zoning Controller", description = "CRUD APIs for Managing Zoning Compliance")
public class ZoningController {

    private final VerificationService verificationService;

    public ZoningController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Create zoning record", description = "Creates a new zoning compliance record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Zoning record created successfully",
                    content = @Content(schema = @Schema(implementation = ZoningInformationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<ZoningInformationResponse> createZoning(@Valid @RequestBody ZoningInformationRequest request) {
        ZoningInformationResponse response = verificationService.createZoning(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get zoning record by ID", description = "Retrieves a specific zoning record by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Zoning record retrieved",
                    content = @Content(schema = @Schema(implementation = ZoningInformationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Zoning record not found")
    })
    public ResponseEntity<ZoningInformationResponse> getZoningById(@PathVariable("id") Long id) {
        ZoningInformationResponse response = verificationService.getZoningById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get zoning records for a property", description = "Lists all zoning records associated with a specific property ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Zoning records list retrieved"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<ZoningInformationResponse>> getZoningByProperty(@PathVariable("propertyId") Long propertyId) {
        List<ZoningInformationResponse> response = verificationService.getZoningByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Update zoning record details", description = "Updates details of an existing zoning record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Zoning record updated successfully",
                    content = @Content(schema = @Schema(implementation = ZoningInformationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Zoning record or Property not found")
    })
    public ResponseEntity<ZoningInformationResponse> updateZoning(
            @PathVariable("id") Long id,
            @Valid @RequestBody ZoningInformationRequest request
    ) {
        ZoningInformationResponse response = verificationService.updateZoning(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Delete zoning record", description = "Deletes a zoning record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Zoning record deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Zoning record not found")
    })
    public ResponseEntity<Void> deleteZoning(@PathVariable("id") Long id) {
        verificationService.deleteZoning(id);
        return ResponseEntity.noContent().build();
    }
}
