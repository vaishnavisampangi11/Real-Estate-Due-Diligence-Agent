package com.realestate.agent.controller;

import com.realestate.agent.dto.ComparablePropertyRequest;
import com.realestate.agent.dto.ComparablePropertyResponse;
import com.realestate.agent.service.MarketAnalysisService;
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
@RequestMapping("/api/market-analysis")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Market Analysis Controller", description = "CRUD APIs for Comparable Property and Value History Analysis")
public class MarketAnalysisController {

    private final MarketAnalysisService marketAnalysisService;

    public MarketAnalysisController(MarketAnalysisService marketAnalysisService) {
        this.marketAnalysisService = marketAnalysisService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Add comparable property relation", description = "Maps a comparable property link to a primary property. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Relationship created successfully",
                    content = @Content(schema = @Schema(implementation = ComparablePropertyResponse.class))),
            @ApiResponse(responseCode = "400", description = "Property compared to itself or invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Properties not found"),
            @ApiResponse(responseCode = "409", description = "Relationship already exists")
    })
    public ResponseEntity<ComparablePropertyResponse> addComparableProperty(
            @Valid @RequestBody ComparablePropertyRequest request
    ) {
        ComparablePropertyResponse response = marketAnalysisService.addComparableProperty(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get comparable property record by ID", description = "Retrieves details of a specific comparable property mapping by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Record retrieved successfully",
                    content = @Content(schema = @Schema(implementation = ComparablePropertyResponse.class))),
            @ApiResponse(responseCode = "404", description = "Record not found")
    })
    public ResponseEntity<ComparablePropertyResponse> getComparablePropertyById(@PathVariable("id") Long id) {
        ComparablePropertyResponse response = marketAnalysisService.getComparablePropertyById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get comparable properties list for a property", description = "Retrieves all comparable property links mapped to a primary property ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comparables list retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Primary property not found")
    })
    public ResponseEntity<List<ComparablePropertyResponse>> getComparablePropertiesForProperty(
            @PathVariable("propertyId") Long propertyId
    ) {
        List<ComparablePropertyResponse> response = marketAnalysisService.getComparablePropertiesForProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Update comparable property relation", description = "Modifies a comparable property relation link. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Relationship updated successfully",
                    content = @Content(schema = @Schema(implementation = ComparablePropertyResponse.class))),
            @ApiResponse(responseCode = "400", description = "Property compared to itself or invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Record or properties not found"),
            @ApiResponse(responseCode = "409", description = "Relationship already exists on another record")
    })
    public ResponseEntity<ComparablePropertyResponse> updateComparableProperty(
            @PathVariable("id") Long id,
            @Valid @RequestBody ComparablePropertyRequest request
    ) {
        ComparablePropertyResponse response = marketAnalysisService.updateComparableProperty(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Delete comparable property relation", description = "Deletes a comparable property relationship mapping. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Relationship deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Record not found")
    })
    public ResponseEntity<Void> deleteComparableProperty(@PathVariable("id") Long id) {
        marketAnalysisService.deleteComparableProperty(id);
        return ResponseEntity.noContent().build();
    }
}
