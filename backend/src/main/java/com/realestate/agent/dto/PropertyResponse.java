package com.realestate.agent.dto;

import com.realestate.agent.enums.AddressType;
import com.realestate.agent.enums.ListingStatus;
import com.realestate.agent.enums.PropertyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponse {

    private Long propertyId;
    private String propertyCode;
    private String propertyType;
    private String propertyName;
    private String description;
    private Integer builtYear;
    private BigDecimal totalArea;
    private BigDecimal landArea;
    private BigDecimal marketValue;
    private PropertyStatus status;
    private Long createdById;
    private String createdByEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private AddressResponse address;
    private List<ListingResponse> listings;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressResponse {
        private Long addressId;
        private AddressType addressType;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String district;
        private String state;
        private String country;
        private String postalCode;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Boolean validationStatus;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ListingResponse {
        private Long listingId;
        private String listingSource;
        private String listingUrl;
        private BigDecimal listingPrice;
        private LocalDate listingDate;
        private ListingStatus listingStatus;
        private LocalDateTime createdAt;
    }
}
