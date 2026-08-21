package com.realestate.agent.dto;

import com.realestate.agent.enums.AddressType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyCreateRequest {

    @NotBlank(message = "Property code is required")
    private String propertyCode;

    @NotBlank(message = "Property type is required")
    private String propertyType; // e.g. "Residential", "Commercial"

    @NotBlank(message = "Property name is required")
    private String propertyName;

    private String description;

    @Min(value = 1800, message = "Built year must be valid")
    private Integer builtYear;

    @DecimalMin(value = "0.01", message = "Total area must be greater than 0")
    private BigDecimal totalArea;

    @DecimalMin(value = "0.01", message = "Land area must be greater than 0")
    private BigDecimal landArea;

    @NotNull(message = "Market value is required")
    @DecimalMin(value = "0.0", message = "Market value cannot be negative")
    private BigDecimal marketValue;

    @Valid
    @NotNull(message = "Address is required")
    private AddressRequest address;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressRequest {

        @Builder.Default
        private AddressType addressType = AddressType.PHYSICAL;

        @NotBlank(message = "Address line 1 is required")
        private String addressLine1;

        private String addressLine2;

        @NotBlank(message = "City is required")
        private String city;

        private String district;

        @NotBlank(message = "State is required")
        private String state;

        @Builder.Default
        @NotBlank(message = "Country is required")
        private String country = "India";

        @NotBlank(message = "Postal code is required")
        private String postalCode;

        private BigDecimal latitude;
        private BigDecimal longitude;
    }
}
