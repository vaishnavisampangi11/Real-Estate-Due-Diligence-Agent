package com.realestate.agent.controller;

import com.realestate.agent.service.AddressValidationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
@SecurityRequirement(name = "bearerAuth")
public class AddressController {

    private final AddressValidationService addressValidationService;

    public AddressController(AddressValidationService addressValidationService) {
        this.addressValidationService = addressValidationService;
    }

    @PostMapping("/{id}/validate")
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    public ResponseEntity<Map<String, Object>> validateAddress(@PathVariable("id") Long id) {
        boolean isValid = addressValidationService.validateAddress(id);

        Map<String, Object> response = new HashMap<>();
        response.put("addressId", id);
        response.put("validated", isValid);
        response.put("message", isValid ? "Address is valid." : "Address validation failed.");

        return ResponseEntity.ok(response);
    }
}
