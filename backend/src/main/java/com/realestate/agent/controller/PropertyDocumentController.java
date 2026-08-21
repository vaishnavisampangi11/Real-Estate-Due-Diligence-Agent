package com.realestate.agent.controller;

import com.realestate.agent.dto.PropertyDocumentRequest;
import com.realestate.agent.dto.PropertyDocumentResponse;
import com.realestate.agent.security.CustomUserDetails;
import com.realestate.agent.service.ReportService;
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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Property Document Controller", description = "CRUD APIs for Managing Property Supporting Documents")
public class PropertyDocumentController {

    private final ReportService reportService;

    public PropertyDocumentController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'LEGAL_REVIEWER', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Upload property document metadata", description = "Registers metadata for an uploaded supporting document. Only Administrators, Legal Reviewers, and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Document metadata created successfully",
                    content = @Content(schema = @Schema(implementation = PropertyDocumentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "Property, Report or User not found")
    })
    public ResponseEntity<PropertyDocumentResponse> uploadDocument(
            @Valid @RequestBody PropertyDocumentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        PropertyDocumentResponse response = reportService.uploadDocument(request, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all property documents", description = "Retrieves a list of all registered property supporting documents in the vault.")
    @ApiResponse(responseCode = "200", description = "Documents list retrieved")
    public ResponseEntity<List<PropertyDocumentResponse>> getAllDocuments() {
        List<PropertyDocumentResponse> response = reportService.getAllDocuments();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document by ID", description = "Retrieves details of a specific property document by ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Document details retrieved",
                    content = @Content(schema = @Schema(implementation = PropertyDocumentResponse.class))),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<PropertyDocumentResponse> getDocumentById(@PathVariable("id") Long id) {
        PropertyDocumentResponse response = reportService.getDocumentById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/property/{propertyId}")
    @Operation(summary = "Get documents for a property", description = "Lists all supporting documents associated with a specific property ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Documents list retrieved"),
            @ApiResponse(responseCode = "404", description = "Property not found")
    })
    public ResponseEntity<List<PropertyDocumentResponse>> getDocumentsByProperty(@PathVariable("propertyId") Long propertyId) {
        List<PropertyDocumentResponse> response = reportService.getDocumentsByProperty(propertyId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/report/{reportId}")
    @Operation(summary = "Get documents for a report", description = "Lists all supporting documents linked to a specific due diligence report ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Documents list retrieved"),
            @ApiResponse(responseCode = "404", description = "Report not found")
    })
    public ResponseEntity<List<PropertyDocumentResponse>> getDocumentsByReport(@PathVariable("reportId") Long reportId) {
        List<PropertyDocumentResponse> response = reportService.getDocumentsByReport(reportId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'LEGAL_REVIEWER', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Update document details", description = "Updates details of an existing document record. Only Administrators, Legal Reviewers, and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Document updated successfully",
                    content = @Content(schema = @Schema(implementation = PropertyDocumentResponse.class))),
            @ApiResponse(responseCode = "404", description = "Document, Property, or Report not found")
    })
    public ResponseEntity<PropertyDocumentResponse> updateDocument(
            @PathVariable("id") Long id,
            @Valid @RequestBody PropertyDocumentRequest request
    ) {
        PropertyDocumentResponse response = reportService.updateDocument(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'LEGAL_REVIEWER', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Delete document", description = "Deletes a property document record. Only Administrators, Legal Reviewers, and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Document deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<Void> deleteDocument(@PathVariable("id") Long id) {
        reportService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
