package com.realestate.agent.controller;

import com.realestate.agent.dto.PermitRequest;
import com.realestate.agent.dto.PermitResponse;
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
@RequestMapping("/api/verification/permits")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Permit Controller", description = "CRUD APIs for Managing Building Permits")
public class PermitController {

    private final VerificationService verificationService;

    public PermitController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Create permit record", description = "Creates a new building permit record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Permit record created successfully",
                    content = @Content(schema = @Schema(implementation = PermitResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Property not found"),
            @ApiResponse(responseCode = "409", description = "Permit number already exists")
    })
    public ResponseEntity<PermitResponse> createPermit(@Valid @RequestBody PermitRequest request) {
        PermitResponse response = verificationService.createPermit(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get permit record by ID", description = "Retrieves a specific permit record by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Permit record retrieved",
                    content = @Content(schema = @Schema(implementation = PermitResponse.class))),
            @ApiResponse(responseCode = "404", description = "Permit record not found")
    })
    public ResponseEntity<PermitResponse> getPermitById(@PathVariable("id") Long id) {
        PermitResponse response = verificationService.getPermitById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get permit records for a property", description = "Lists all permit records associated with a specific property ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Permit records list retrieved"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<PermitResponse>> getPermitsByProperty(@PathVariable("propertyId") Long propertyId) {
        List<PermitResponse> response = verificationService.getPermitsByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Update permit record details", description = "Updates details of an existing building permit record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Permit record updated successfully",
                    content = @Content(schema = @Schema(implementation = PermitResponse.class))),
            @ApiResponse(responseCode = "404", description = "Permit record or Property not found"),
            @ApiResponse(responseCode = "409", description = "Permit number already exists on another record")
    })
    public ResponseEntity<PermitResponse> updatePermit(
            @PathVariable("id") Long id,
            @Valid @RequestBody PermitRequest request
    ) {
        PermitResponse response = verificationService.updatePermit(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Delete permit record", description = "Deletes a permit record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Permit record deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Permit record not found")
    })
    public ResponseEntity<Void> deletePermit(@PathVariable("id") Long id) {
        verificationService.deletePermit(id);
        return ResponseEntity.noContent().build();
    }
}
