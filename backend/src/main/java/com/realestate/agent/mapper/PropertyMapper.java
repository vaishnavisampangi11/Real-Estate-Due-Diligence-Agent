package com.realestate.agent.mapper;

import com.realestate.agent.dto.PropertyResponse;
import com.realestate.agent.entity.Address;
import com.realestate.agent.entity.Property;
import com.realestate.agent.entity.PropertyListing;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class PropertyMapper {

    public PropertyResponse toResponse(Property property, Address address, List<PropertyListing> listings) {
        if (property == null) {
            return null;
        }

        return PropertyResponse.builder()
                .propertyId(property.getPropertyId())
                .propertyCode(property.getPropertyCode())
                .propertyType(property.getPropertyType().getTypeName())
                .propertyName(property.getPropertyName())
                .description(property.getDescription())
                .builtYear(property.getBuiltYear())
                .totalArea(property.getTotalArea())
                .landArea(property.getLandArea())
                .marketValue(property.getMarketValue())
                .status(property.getStatus())
                .createdById(property.getCreatedBy().getUserId())
                .createdByEmail(property.getCreatedBy().getEmail())
                .createdAt(property.getCreatedAt())
                .updatedAt(property.getUpdatedAt())
                .address(toAddressResponse(address))
                .listings(toListingResponses(listings))
                .build();
    }

    public PropertyResponse.AddressResponse toAddressResponse(Address address) {
        if (address == null) {
            return null;
        }

        return PropertyResponse.AddressResponse.builder()
                .addressId(address.getAddressId())
                .addressType(address.getAddressType())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .district(address.getDistrict())
                .state(address.getState())
                .country(address.getCountry())
                .postalCode(address.getPostalCode())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .validationStatus(address.getValidationStatus())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }

    public PropertyResponse.ListingResponse toListingResponse(PropertyListing listing) {
        if (listing == null) {
            return null;
        }

        return PropertyResponse.ListingResponse.builder()
                .listingId(listing.getListingId())
                .listingSource(listing.getListingSource())
                .listingUrl(listing.getListingUrl())
                .listingPrice(listing.getListingPrice())
                .listingDate(listing.getListingDate())
                .listingStatus(listing.getListingStatus())
                .createdAt(listing.getCreatedAt())
                .build();
    }

    public List<PropertyResponse.ListingResponse> toListingResponses(List<PropertyListing> listings) {
        if (listings == null) {
            return List.of();
        }
        return listings.stream()
                .map(this::toListingResponse)
                .collect(Collectors.toList());
    }
}
