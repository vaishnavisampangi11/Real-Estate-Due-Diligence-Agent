package com.realestate.agent.controller;

import com.realestate.agent.dto.OwnershipRecordRequest;
import com.realestate.agent.dto.OwnershipRecordResponse;
import com.realestate.agent.service.OwnershipService;
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
@RequestMapping("/api/ownership-records")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Ownership Split Controller", description = "CRUD APIs for Managing Property Ownership Percentages")
public class OwnershipRecordController {

    private final OwnershipService ownershipService;

    public OwnershipRecordController(OwnershipService ownershipService) {
        this.ownershipService = ownershipService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Assign ownership split", description = "Allocates a percentage share of a property to an owner. Total active percentage cannot exceed 100%. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Ownership record created successfully",
                    content = @Content(schema = @Schema(implementation = OwnershipRecordResponse.class))),
            @ApiResponse(responseCode = "400", description = "Ownership percentage limit exceeded or invalid data"),
            @ApiResponse(responseCode = "404", description = "Property or Owner not found")
    })
    public ResponseEntity<OwnershipRecordResponse> addOwnershipRecord(
            @Valid @RequestBody OwnershipRecordRequest request
    ) {
        OwnershipRecordResponse response = ownershipService.addOwnershipRecord(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get ownership split for a property", description = "Retrieves all ownership records (historical and current) for a specific property.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ownership list retrieved"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<OwnershipRecordResponse>> getOwnershipRecordsByProperty(
            @PathVariable("propertyId") Long propertyId
    ) {
        List<OwnershipRecordResponse> response = ownershipService.getOwnershipRecordsByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get ownership record by ID", description = "Retrieves a single property ownership record by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ownership record details retrieved",
                    content = @Content(schema = @Schema(implementation = OwnershipRecordResponse.class))),
            @ApiResponse(responseCode = "404", description = "Ownership record not found")
    })
    public ResponseEntity<OwnershipRecordResponse> getOwnershipRecordById(@PathVariable("id") Long id) {
        OwnershipRecordResponse response = ownershipService.getOwnershipRecordById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Update ownership record details", description = "Updates details of a property ownership record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Ownership record updated successfully",
                    content = @Content(schema = @Schema(implementation = OwnershipRecordResponse.class))),
            @ApiResponse(responseCode = "400", description = "Ownership percentage limit exceeded"),
            @ApiResponse(responseCode = "404", description = "Ownership record, property or owner not found")
    })
    public ResponseEntity<OwnershipRecordResponse> updateOwnershipRecord(
            @PathVariable("id") Long id,
            @Valid @RequestBody OwnershipRecordRequest request
    ) {
        OwnershipRecordResponse response = ownershipService.updateOwnershipRecord(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Delete ownership record", description = "Removes an ownership record from a property. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Ownership record deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Ownership record not found")
    })
    public ResponseEntity<Void> deleteOwnershipRecord(@PathVariable("id") Long id) {
        ownershipService.deleteOwnershipRecord(id);
        return ResponseEntity.noContent().build();
    }
}
