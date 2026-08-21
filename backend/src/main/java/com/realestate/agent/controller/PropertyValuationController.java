package com.realestate.agent.controller;

import com.realestate.agent.dto.PropertyValuationResponse;
import com.realestate.agent.service.PropertyValuationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/property-valuations")
@SecurityRequirement(name = "bearerAuth")
@Tag(
        name = "Property Valuation Controller",
        description = "APIs for Property Valuation Comparison"
)
public class PropertyValuationController {

    private final PropertyValuationService propertyValuationService;

    public PropertyValuationController(
            PropertyValuationService propertyValuationService
    ) {
        this.propertyValuationService = propertyValuationService;
    }

    @GetMapping("/{propertyId}")
    @Operation(summary = "Generate Property Valuation")
    public ResponseEntity<PropertyValuationResponse> generateValuation(
            @PathVariable Long propertyId
    ) {

        PropertyValuationResponse response =
                propertyValuationService.generateValuation(propertyId);

        return ResponseEntity.ok(response);
    }
}