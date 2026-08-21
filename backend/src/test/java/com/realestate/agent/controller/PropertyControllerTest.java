package com.realestate.agent.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.agent.dto.PropertyResponse;
import com.realestate.agent.dto.PropertySearchCriteria;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.security.CustomAccessDeniedHandler;
import com.realestate.agent.security.CustomUserDetailsService;
import com.realestate.agent.security.JwtAuthenticationEntryPoint;
import com.realestate.agent.security.JwtAuthenticationFilter;
import com.realestate.agent.security.JwtService;
import com.realestate.agent.service.PropertyService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = PropertyController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientWebSecurityAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
class PropertyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PropertyService propertyService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @MockBean
    private CustomAccessDeniedHandler customAccessDeniedHandler;

    @MockBean
    private com.realestate.agent.security.OAuth2AuthenticationSuccessHandler oauth2AuthenticationSuccessHandler;

    @MockBean
    private com.realestate.agent.security.OAuth2AuthenticationFailureHandler oauth2AuthenticationFailureHandler;

    @MockBean
    private org.springframework.security.oauth2.client.registration.ClientRegistrationRepository clientRegistrationRepository;

    @Test
    @DisplayName("GET /api/properties/{id} should return property details")
    void getPropertyById_Success() throws Exception {
        PropertyResponse response = PropertyResponse.builder()
                .propertyId(10L)
                .propertyCode("PROP-HYD-010")
                .propertyName("Gachibowli Villa")
                .marketValue(new BigDecimal("42500000.00"))
                .build();

        when(propertyService.getPropertyById(10L)).thenReturn(response);

        mockMvc.perform(get("/api/properties/10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.propertyId").value(10))
                .andExpect(jsonPath("$.propertyCode").value("PROP-HYD-010"))
                .andExpect(jsonPath("$.propertyName").value("Gachibowli Villa"));
    }

    @Test
    @DisplayName("GET /api/properties/{id} should return 404 Not Found when ID does not exist")
    void getPropertyById_NotFound() throws Exception {
        when(propertyService.getPropertyById(999L)).thenThrow(new ResourceNotFoundException("Property not found with ID: 999"));

        mockMvc.perform(get("/api/properties/999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/properties should return paginated list")
    void getAllProperties_Success() throws Exception {
        PropertyResponse response = PropertyResponse.builder()
                .propertyId(10L)
                .propertyCode("PROP-HYD-010")
                .propertyName("Gachibowli Villa")
                .build();

        Page<PropertyResponse> page = new PageImpl<>(List.of(response));
        when(propertyService.searchProperties(any(PropertySearchCriteria.class))).thenReturn(page);

        mockMvc.perform(get("/api/properties?page=0&size=10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].propertyId").value(10))
                .andExpect(jsonPath("$.content[0].propertyCode").value("PROP-HYD-010"));
    }

    @Test
    @DisplayName("GET /api/properties/search should return matching properties")
    void searchProperties_Success() throws Exception {
        PropertyResponse response = PropertyResponse.builder()
                .propertyId(10L)
                .propertyCode("PROP-HYD-010")
                .propertyName("Gachibowli Villa")
                .build();

        Page<PropertyResponse> page = new PageImpl<>(List.of(response));
        when(propertyService.searchProperties(any(PropertySearchCriteria.class))).thenReturn(page);

        mockMvc.perform(get("/api/properties/search?city=Hyderabad")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].propertyId").value(10));
    }
}
