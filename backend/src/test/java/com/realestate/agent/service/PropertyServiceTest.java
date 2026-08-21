package com.realestate.agent.service;

import com.realestate.agent.dto.PropertyCreateRequest;
import com.realestate.agent.dto.PropertyResponse;
import com.realestate.agent.dto.PropertySearchCriteria;
import com.realestate.agent.entity.Address;
import com.realestate.agent.entity.Property;
import com.realestate.agent.entity.PropertyType;
import com.realestate.agent.entity.User;
import com.realestate.agent.exception.ResourceAlreadyExistsException;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.PropertyMapper;
import com.realestate.agent.repository.*;
import com.realestate.agent.service.impl.PropertyServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PropertyServiceTest {

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private PropertyTypeRepository propertyTypeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressRepository addressRepository;

    @Mock
    private PropertyListingRepository propertyListingRepository;

    @Mock
    private PropertyMapper propertyMapper;

    @InjectMocks
    private PropertyServiceImpl propertyService;

    private Property mockProperty;
    private PropertyType mockType;
    private User mockUser;
    private Address mockAddress;
    private PropertyResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockType = PropertyType.builder()
                .propertyTypeId(1L)
                .typeName("VILLA")
                .build();

        mockUser = User.builder()
                .userId(1L)
                .email("agent@example.com")
                .build();

        mockProperty = Property.builder()
                .propertyId(10L)
                .propertyCode("PROP-HYD-010")
                .propertyName("Cyber Towers Villa")
                .propertyType(mockType)
                .marketValue(new BigDecimal("45000000.00"))
                .createdBy(mockUser)
                .build();

        mockAddress = Address.builder()
                .addressId(20L)
                .property(mockProperty)
                .city("Hyderabad")
                .state("Telangana")
                .build();

        mockResponse = PropertyResponse.builder()
                .propertyId(10L)
                .propertyCode("PROP-HYD-010")
                .propertyName("Cyber Towers Villa")
                .marketValue(new BigDecimal("45000000.00"))
                .build();
    }

    @Test
    @DisplayName("Should successfully retrieve property by ID")
    void getPropertyById_Success() {
        when(propertyRepository.findById(10L)).thenReturn(Optional.of(mockProperty));
        when(addressRepository.findByPropertyPropertyId(10L)).thenReturn(List.of(mockAddress));
        when(propertyListingRepository.findByPropertyPropertyId(10L)).thenReturn(List.of());
        when(propertyMapper.toResponse(mockProperty, mockAddress, List.of())).thenReturn(mockResponse);

        PropertyResponse response = propertyService.getPropertyById(10L);

        assertNotNull(response);
        assertEquals(10L, response.getPropertyId());
        assertEquals("PROP-HYD-010", response.getPropertyCode());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when property ID does not exist")
    void getPropertyById_NotFound_ThrowsException() {
        when(propertyRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> propertyService.getPropertyById(999L));
    }

    @Test
    @DisplayName("Should create a property successfully")
    void createProperty_Success() {
        PropertyCreateRequest.AddressRequest addrReq = PropertyCreateRequest.AddressRequest.builder()
                .addressType(com.realestate.agent.enums.AddressType.PHYSICAL)
                .addressLine1("Plot 12")
                .city("Hyderabad")
                .state("Telangana")
                .country("India")
                .postalCode("500032")
                .build();

        PropertyCreateRequest createReq = PropertyCreateRequest.builder()
                .propertyCode("PROP-HYD-010")
                .propertyName("Cyber Towers Villa")
                .propertyType("VILLA")
                .marketValue(new BigDecimal("45000000.00"))
                .address(addrReq)
                .build();

        when(propertyRepository.existsByPropertyCode("PROP-HYD-010")).thenReturn(false);
        when(propertyTypeRepository.findByTypeName("VILLA")).thenReturn(Optional.of(mockType));
        when(userRepository.findByEmail("agent@example.com")).thenReturn(Optional.of(mockUser));
        when(propertyRepository.save(any(Property.class))).thenReturn(mockProperty);
        when(addressRepository.save(any(Address.class))).thenReturn(mockAddress);
        when(propertyMapper.toResponse(mockProperty, mockAddress, List.of())).thenReturn(mockResponse);

        PropertyResponse response = propertyService.createProperty(createReq, "agent@example.com");

        assertNotNull(response);
        assertEquals(10L, response.getPropertyId());
        verify(propertyRepository, times(1)).save(any(Property.class));
        verify(addressRepository, times(1)).save(any(Address.class));
    }

    @Test
    @DisplayName("Should throw ResourceAlreadyExistsException when property code is duplicate")
    void createProperty_DuplicateCode_ThrowsException() {
        PropertyCreateRequest createReq = PropertyCreateRequest.builder()
                .propertyCode("PROP-HYD-010")
                .build();

        when(propertyRepository.existsByPropertyCode("PROP-HYD-010")).thenReturn(true);

        assertThrows(ResourceAlreadyExistsException.class, () -> propertyService.createProperty(createReq, "agent@example.com"));
        verify(propertyRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should return paginated search results for properties")
    void searchProperties_Success() {
        PropertySearchCriteria criteria = PropertySearchCriteria.builder()
                .city("Hyderabad")
                .page(0)
                .size(10)
                .sortBy("createdAt")
                .sortDirection("DESC")
                .build();

        Page<Property> page = new PageImpl<>(List.of(mockProperty));
        when(propertyRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);
        when(addressRepository.findByPropertyPropertyIdIn(List.of(10L))).thenReturn(List.of(mockAddress));
        when(propertyListingRepository.findByPropertyPropertyIdIn(List.of(10L))).thenReturn(List.of());
        when(propertyMapper.toResponse(mockProperty, mockAddress, List.of())).thenReturn(mockResponse);

        Page<PropertyResponse> result = propertyService.searchProperties(criteria);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("PROP-HYD-010", result.getContent().get(0).getPropertyCode());
    }
}
