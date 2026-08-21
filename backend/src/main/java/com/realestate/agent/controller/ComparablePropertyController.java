package com.realestate.agent.controller;

import com.realestate.agent.dto.ComparablePropertyRequest;
import com.realestate.agent.dto.ComparablePropertyResponse;
import com.realestate.agent.service.ComparablePropertyService;
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

import com.realestate.agent.dto.ComparablePropertyAnalysisResponse;

import java.util.List;

@RestController
@RequestMapping("/api/comparable-properties")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Comparable Property Controller",
        description = "CRUD APIs for Comparable Property Analysis")
public class ComparablePropertyController {

    private final ComparablePropertyService comparablePropertyService;

    public ComparablePropertyController(
            ComparablePropertyService comparablePropertyService) {
        this.comparablePropertyService = comparablePropertyService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','REAL_ESTATE_AGENT')")
    @Operation(summary = "Create Comparable Property")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201",
                    description = "Comparable Property Created",
                    content = @Content(schema =
                    @Schema(implementation = ComparablePropertyResponse.class))),
            @ApiResponse(responseCode = "400",
                    description = "Invalid Request")
    })
    public ResponseEntity<ComparablePropertyResponse> createComparableProperty(
            @Valid @RequestBody ComparablePropertyRequest request) {

        ComparablePropertyResponse response =
                comparablePropertyService.createComparableProperty(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Comparable Property By Id")
    public ResponseEntity<ComparablePropertyResponse> getComparablePropertyById(
            @PathVariable Long id) {

        ComparablePropertyResponse response =
                comparablePropertyService.getComparablePropertyById(id);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get Comparable Properties of a Property")
    public ResponseEntity<List<ComparablePropertyResponse>>
    getComparablePropertiesByProperty(
            @PathVariable Long propertyId) {

        List<ComparablePropertyResponse> response =
                comparablePropertyService
                        .getComparablePropertiesByProperty(propertyId);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','REAL_ESTATE_AGENT')")
    @Operation(summary = "Update Comparable Property")
    public ResponseEntity<ComparablePropertyResponse>
    updateComparableProperty(
            @PathVariable Long id,
            @Valid @RequestBody ComparablePropertyRequest request) {

        ComparablePropertyResponse response =
                comparablePropertyService
                        .updateComparableProperty(id, request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/analysis/{propertyId}")
    public ResponseEntity<ComparablePropertyAnalysisResponse> analyzeComparableProperty(
            @PathVariable Long propertyId) {

        ComparablePropertyAnalysisResponse response =
                comparablePropertyService.analyzeComparableProperty(propertyId);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR','REAL_ESTATE_AGENT')")
    @Operation(summary = "Delete Comparable Property")
    public ResponseEntity<Void> deleteComparableProperty(
            @PathVariable Long id) {

        comparablePropertyService.deleteComparableProperty(id);

        return ResponseEntity.noContent().build();
    }
}