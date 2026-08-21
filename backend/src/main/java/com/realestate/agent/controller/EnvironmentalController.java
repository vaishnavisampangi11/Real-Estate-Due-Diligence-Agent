package com.realestate.agent.controller;

import com.realestate.agent.dto.EnvironmentalRecordRequest;
import com.realestate.agent.dto.EnvironmentalRecordResponse;
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
@RequestMapping("/api/verification/environmental")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Environmental Controller", description = "CRUD APIs for Managing Environmental Risks & Records")
public class EnvironmentalController {

    private final VerificationService verificationService;

    public EnvironmentalController(VerificationService verificationService) {
        this.verificationService = verificationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Create environmental record", description = "Creates a new environmental record for a property. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Environmental record created successfully",
                    content = @Content(schema = @Schema(implementation = EnvironmentalRecordResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<EnvironmentalRecordResponse> createEnvironmentalRecord(
            @Valid @RequestBody EnvironmentalRecordRequest request
    ) {
        EnvironmentalRecordResponse response = verificationService.createEnvironmentalRecord(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get environmental record by ID", description = "Retrieves a specific environmental record by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Environmental record retrieved",
                    content = @Content(schema = @Schema(implementation = EnvironmentalRecordResponse.class))),
            @ApiResponse(responseCode = "404", description = "Environmental record not found")
    })
    public ResponseEntity<EnvironmentalRecordResponse> getEnvironmentalRecordById(@PathVariable("id") Long id) {
        EnvironmentalRecordResponse response = verificationService.getEnvironmentalRecordById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get environmental records for a property", description = "Lists all environmental records associated with a specific property ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Environmental records list retrieved"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<EnvironmentalRecordResponse>> getEnvironmentalRecordsByProperty(
            @PathVariable("propertyId") Long propertyId
    ) {
        List<EnvironmentalRecordResponse> response = verificationService.getEnvironmentalRecordsByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Update environmental record details", description = "Updates details of an existing environmental record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Environmental record updated successfully",
                    content = @Content(schema = @Schema(implementation = EnvironmentalRecordResponse.class))),
            @ApiResponse(responseCode = "404", description = "Environmental record or Property not found")
    })
    public ResponseEntity<EnvironmentalRecordResponse> updateEnvironmentalRecord(
            @PathVariable("id") Long id,
            @Valid @RequestBody EnvironmentalRecordRequest request
    ) {
        EnvironmentalRecordResponse response = verificationService.updateEnvironmentalRecord(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Delete environmental record", description = "Deletes an environmental record. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Environmental record deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Environmental record not found")
    })
    public ResponseEntity<Void> deleteEnvironmentalRecord(@PathVariable("id") Long id) {
        verificationService.deleteEnvironmentalRecord(id);
        return ResponseEntity.noContent().build();
    }
}
