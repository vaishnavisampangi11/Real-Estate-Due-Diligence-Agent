package com.realestate.agent.service.impl;

import com.realestate.agent.dto.PropertyCreateRequest;
import com.realestate.agent.dto.PropertyResponse;
import com.realestate.agent.dto.PropertySearchCriteria;
import com.realestate.agent.entity.Address;
import com.realestate.agent.entity.Property;
import com.realestate.agent.entity.PropertyListing;
import com.realestate.agent.entity.PropertyType;
import com.realestate.agent.entity.User;
import com.realestate.agent.exception.ResourceAlreadyExistsException;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.PropertyMapper;
import com.realestate.agent.repository.*;
import com.realestate.agent.service.PropertyService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyTypeRepository propertyTypeRepository;
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final PropertyListingRepository propertyListingRepository;
    private final PropertyMapper propertyMapper;

    public PropertyServiceImpl(
            PropertyRepository propertyRepository,
            PropertyTypeRepository propertyTypeRepository,
            UserRepository userRepository,
            AddressRepository addressRepository,
            PropertyListingRepository propertyListingRepository,
            PropertyMapper propertyMapper
    ) {
        this.propertyRepository = propertyRepository;
        this.propertyTypeRepository = propertyTypeRepository;
        this.userRepository = userRepository;
        this.addressRepository = addressRepository;
        this.propertyListingRepository = propertyListingRepository;
        this.propertyMapper = propertyMapper;
    }

    @Override
    @Transactional
    public PropertyResponse createProperty(PropertyCreateRequest request, String userEmail) {
        if (propertyRepository.existsByPropertyCode(request.getPropertyCode())) {
            throw new ResourceAlreadyExistsException("Property code already exists: " + request.getPropertyCode());
        }

        PropertyType propertyType = propertyTypeRepository.findByTypeName(request.getPropertyType())
                .orElseThrow(() -> new ResourceNotFoundException("Property type not found: " + request.getPropertyType()));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Property property = Property.builder()
                .propertyCode(request.getPropertyCode())
                .propertyType(propertyType)
                .propertyName(request.getPropertyName())
                .description(request.getDescription())
                .builtYear(request.getBuiltYear())
                .totalArea(request.getTotalArea())
                .landArea(request.getLandArea())
                .marketValue(request.getMarketValue())
                .createdBy(user)
                .build();

        Property savedProperty = propertyRepository.save(property);

        PropertyCreateRequest.AddressRequest addressRequest = request.getAddress();
        Address address = Address.builder()
                .property(savedProperty)
                .addressType(addressRequest.getAddressType())
                .addressLine1(addressRequest.getAddressLine1())
                .addressLine2(addressRequest.getAddressLine2())
                .city(addressRequest.getCity())
                .district(addressRequest.getDistrict())
                .state(addressRequest.getState())
                .country(addressRequest.getCountry())
                .postalCode(addressRequest.getPostalCode())
                .latitude(addressRequest.getLatitude())
                .longitude(addressRequest.getLongitude())
                .validationStatus(false)
                .build();

        Address savedAddress = addressRepository.save(address);

        return propertyMapper.toResponse(savedProperty, savedAddress, List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PropertyResponse> searchProperties(PropertySearchCriteria criteria) {
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(criteria.getSortDirection().toUpperCase());
        } catch (Exception e) {
            direction = Sort.Direction.DESC;
        }

        String sortBy = criteria.getSortBy();
        if (sortBy == null || sortBy.trim().isEmpty() ||
                !List.of("propertyId", "propertyCode", "propertyName", "description", "builtYear", 
                        "totalArea", "landArea", "marketValue", "status", "createdAt", "updatedAt")
                .contains(sortBy.trim())) {
            sortBy = "createdAt";
        } else {
            sortBy = sortBy.trim();
        }

        int page = (criteria.getPage() == null || criteria.getPage() < 0) ? 0 : criteria.getPage();
        int size = (criteria.getSize() == null || criteria.getSize() < 1) ? 10 : criteria.getSize();

        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Specification<Property> specification = PropertySpecification.build(criteria);
        Page<Property> propertiesPage = propertyRepository.findAll(specification, pageable);

        List<Property> propertyList = propertiesPage.getContent();
        if (propertyList.isEmpty()) {
            return propertiesPage.map(p -> propertyMapper.toResponse(p, null, List.of()));
        }

        List<Long> propertyIds = propertyList.stream()
                .map(Property::getPropertyId)
                .collect(Collectors.toList());

        Map<Long, Address> addressMap = addressRepository.findByPropertyPropertyIdIn(propertyIds)
                .stream()
                .collect(Collectors.toMap(
                        addr -> addr.getProperty().getPropertyId(),
                        addr -> addr,
                        (existing, replacement) -> existing
                ));

        Map<Long, List<PropertyListing>> listingMap = propertyListingRepository.findByPropertyPropertyIdIn(propertyIds)
                .stream()
                .collect(Collectors.groupingBy(listing -> listing.getProperty().getPropertyId()));

        return propertiesPage.map(property -> {
            Address address = addressMap.get(property.getPropertyId());
            List<PropertyListing> listings = listingMap.getOrDefault(property.getPropertyId(), List.of());
            return propertyMapper.toResponse(property, address, listings);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PropertyResponse> getMyProperties(Long currentUserId, Pageable pageable) {
        Page<Property> propertiesPage = propertyRepository.findByCreatedBy_UserId(currentUserId, pageable);

        List<Property> propertyList = propertiesPage.getContent();
        if (propertyList.isEmpty()) {
            return propertiesPage.map(p -> propertyMapper.toResponse(p, null, List.of()));
        }

        List<Long> propertyIds = propertyList.stream()
                .map(Property::getPropertyId)
                .collect(Collectors.toList());

        Map<Long, Address> addressMap = addressRepository.findByPropertyPropertyIdIn(propertyIds)
                .stream()
                .collect(Collectors.toMap(
                        addr -> addr.getProperty().getPropertyId(),
                        addr -> addr,
                        (existing, replacement) -> existing
                ));

        Map<Long, List<PropertyListing>> listingMap = propertyListingRepository.findByPropertyPropertyIdIn(propertyIds)
                .stream()
                .collect(Collectors.groupingBy(listing -> listing.getProperty().getPropertyId()));

        return propertiesPage.map(property -> {
            Address address = addressMap.get(property.getPropertyId());
            List<PropertyListing> listings = listingMap.getOrDefault(property.getPropertyId(), List.of());
            return propertyMapper.toResponse(property, address, listings);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyResponse getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + id));

        Address address = addressRepository.findByPropertyPropertyId(property.getPropertyId())
                .stream()
                .findFirst()
                .orElse(null);

        List<PropertyListing> listings = propertyListingRepository.findByPropertyPropertyId(property.getPropertyId());

        return propertyMapper.toResponse(property, address, listings);
    }
}
