package com.realestate.agent.controller;

import com.realestate.agent.dto.OwnerRequest;
import com.realestate.agent.dto.OwnerResponse;
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
@RequestMapping("/api/owners")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Owner Controller", description = "CRUD APIs for Managing Property Owners")
public class OwnerController {

    private final OwnershipService ownershipService;

    public OwnerController(OwnershipService ownershipService) {
        this.ownershipService = ownershipService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Register a new owner", description = "Creates a new owner registry. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Owner created successfully",
                    content = @Content(schema = @Schema(implementation = OwnerResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "409", description = "Owner email already exists")
    })
    public ResponseEntity<OwnerResponse> createOwner(@Valid @RequestBody OwnerRequest request) {
        OwnerResponse response = ownershipService.createOwner(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get owner by ID", description = "Retrieves details of an owner by their unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Owner details retrieved",
                    content = @Content(schema = @Schema(implementation = OwnerResponse.class))),
            @ApiResponse(responseCode = "404", description = "Owner not found")
    })
    public ResponseEntity<OwnerResponse> getOwnerById(@PathVariable("id") Long id) {
        OwnerResponse response = ownershipService.getOwnerById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all owners", description = "Retrieves a list of all registered owners.")
    @ApiResponse(responseCode = "200", description = "Owners list retrieved")
    public ResponseEntity<List<OwnerResponse>> getAllOwners() {
        List<OwnerResponse> response = ownershipService.getAllOwners();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Update owner details", description = "Updates details of an existing owner. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Owner details updated",
                    content = @Content(schema = @Schema(implementation = OwnerResponse.class))),
            @ApiResponse(responseCode = "404", description = "Owner not found"),
            @ApiResponse(responseCode = "409", description = "Email already belongs to another owner")
    })
    public ResponseEntity<OwnerResponse> updateOwner(
            @PathVariable("id") Long id,
            @Valid @RequestBody OwnerRequest request
    ) {
        OwnerResponse response = ownershipService.updateOwner(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Delete an owner", description = "Deletes an owner from the registry. Fails if they have active ownership records linked. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Owner deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Owner has linked ownership records"),
            @ApiResponse(responseCode = "404", description = "Owner not found")
    })
    public ResponseEntity<Void> deleteOwner(@PathVariable("id") Long id) {
        ownershipService.deleteOwner(id);
        return ResponseEntity.noContent().build();
    }
}
