package com.realestate.agent.controller;

import com.realestate.agent.dto.PropertyCreateRequest;
import com.realestate.agent.dto.PropertyResponse;
import com.realestate.agent.dto.PropertySearchCriteria;
import com.realestate.agent.security.CustomUserDetails;
import com.realestate.agent.service.PropertyService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/properties")
@SecurityRequirement(name = "bearerAuth")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    public ResponseEntity<PropertyResponse> createProperty(
            @Valid @RequestBody PropertyCreateRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        PropertyResponse response = propertyService.createProperty(request, userDetails.getUsername());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PropertyResponse>> searchProperties(
            PropertySearchCriteria criteria
    ) {
        Page<PropertyResponse> response = propertyService.searchProperties(criteria);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<PropertyResponse>> getAllProperties(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        PropertySearchCriteria criteria = PropertySearchCriteria.builder()
                .page(page)
                .size(size)
                .build();
        Page<PropertyResponse> response = propertyService.searchProperties(criteria);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    public ResponseEntity<Page<PropertyResponse>> getMyProperties(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        Page<PropertyResponse> response = propertyService.getMyProperties(userDetails.getUserId(), pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getPropertyById(
            @PathVariable("id") Long id
    ) {
        PropertyResponse response = propertyService.getPropertyById(id);
        return ResponseEntity.ok(response);
    }
}
