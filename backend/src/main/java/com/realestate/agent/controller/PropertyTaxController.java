package com.realestate.agent.controller;

import com.realestate.agent.dto.PropertyTaxRequest;
import com.realestate.agent.dto.PropertyTaxResponse;
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
@RequestMapping("/api/verification/taxes")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Property Tax Controller", description = "CRUD APIs for Managing Property Tax History")
public class PropertyTaxController {

    private final VerificationService verificationService;

    public PropertyTaxController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Create property tax record", description = "Creates a new property tax record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Tax record created successfully",
                    content = @Content(schema = @Schema(implementation = PropertyTaxResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<PropertyTaxResponse> createPropertyTax(@Valid @RequestBody PropertyTaxRequest request) {
        PropertyTaxResponse response = verificationService.createPropertyTax(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tax record by ID", description = "Retrieves a specific property tax record by its unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tax record retrieved",
                    content = @Content(schema = @Schema(implementation = PropertyTaxResponse.class))),
            @ApiResponse(responseCode = "404", description = "Tax record not found")
    })
    public ResponseEntity<PropertyTaxResponse> getPropertyTaxById(@PathVariable("id") Long id) {
        PropertyTaxResponse response = verificationService.getPropertyTaxById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get tax records for a property", description = "Lists all property tax records associated with a specific property ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tax records list retrieved"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<PropertyTaxResponse>> getPropertyTaxesByProperty(@PathVariable("propertyId") Long propertyId) {
        List<PropertyTaxResponse> response = verificationService.getPropertyTaxesByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Update tax record details", description = "Updates details of an existing property tax record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Tax record updated successfully",
                    content = @Content(schema = @Schema(implementation = PropertyTaxResponse.class))),
            @ApiResponse(responseCode = "404", description = "Tax record or Property not found")
    })
    public ResponseEntity<PropertyTaxResponse> updatePropertyTax(
            @PathVariable("id") Long id,
            @Valid @RequestBody PropertyTaxRequest request
    ) {
        PropertyTaxResponse response = verificationService.updatePropertyTax(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Delete tax record", description = "Deletes a property tax record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Tax record deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Tax record not found")
    })
    public ResponseEntity<Void> deletePropertyTax(@PathVariable("id") Long id) {
        verificationService.deletePropertyTax(id);
        return ResponseEntity.noContent().build();
    }
}
