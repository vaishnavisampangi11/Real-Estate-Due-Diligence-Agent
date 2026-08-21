package com.realestate.agent.controller;

import com.realestate.agent.dto.RiskCategoryRequest;
import com.realestate.agent.dto.RiskCategoryResponse;
import com.realestate.agent.service.RiskService;
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
@RequestMapping("/api/risk-categories")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Risk Category Controller", description = "CRUD APIs for Managing Risk Categories")
public class RiskCategoryController {

    private final RiskService riskService;

    public RiskCategoryController(RiskService riskService) {
        this.riskService = riskService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Create risk category", description = "Registers a new risk category. Only Administrators can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Category created successfully",
                    content = @Content(schema = @Schema(implementation = RiskCategoryResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "409", description = "Category name already exists")
    })
    public ResponseEntity<RiskCategoryResponse> createRiskCategory(@Valid @RequestBody RiskCategoryRequest request) {
        RiskCategoryResponse response = riskService.createRiskCategory(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get risk category by ID", description = "Retrieves details of a specific risk category by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Category details retrieved",
                    content = @Content(schema = @Schema(implementation = RiskCategoryResponse.class))),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    public ResponseEntity<RiskCategoryResponse> getRiskCategoryById(@PathVariable("id") Long id) {
        RiskCategoryResponse response = riskService.getRiskCategoryById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all risk categories", description = "Retrieves a list of all risk categories.")
    @ApiResponse(responseCode = "200", description = "Categories list retrieved")
    public ResponseEntity<List<RiskCategoryResponse>> getAllRiskCategories() {
        List<RiskCategoryResponse> response = riskService.getAllRiskCategories();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Update risk category details", description = "Updates details of an existing risk category. Only Administrators can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Category updated successfully",
                    content = @Content(schema = @Schema(implementation = RiskCategoryResponse.class))),
            @ApiResponse(responseCode = "404", description = "Category not found"),
            @ApiResponse(responseCode = "409", description = "Category name already belongs to another record")
    })
    public ResponseEntity<RiskCategoryResponse> updateRiskCategory(
            @PathVariable("id") Long id,
            @Valid @RequestBody RiskCategoryRequest request
    ) {
        RiskCategoryResponse response = riskService.updateRiskCategory(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(summary = "Delete risk category", description = "Deletes a risk category. Fails if linked to assessments. Only Administrators can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Category deleted successfully"),
            @ApiResponse(responseCode = "400", description = "Category is linked to existing property risk assessments"),
            @ApiResponse(responseCode = "404", description = "Category not found")
    })
    public ResponseEntity<Void> deleteRiskCategory(@PathVariable("id") Long id) {
        riskService.deleteRiskCategory(id);
        return ResponseEntity.noContent().build();
    }
}
