package com.realestate.agent.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;

import static org.junit.jupiter.api.Assertions.*;

class SecurityEntryPointTest {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final JwtAuthenticationEntryPoint entryPoint = new JwtAuthenticationEntryPoint(objectMapper);
    private final CustomAccessDeniedHandler accessDeniedHandler = new CustomAccessDeniedHandler(objectMapper);

    @Test
    @DisplayName("JwtAuthenticationEntryPoint should return 401 JSON error payload")
    void entryPoint_Returns401Json() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/properties");
        MockHttpServletResponse response = new MockHttpServletResponse();
        BadCredentialsException exception = new BadCredentialsException("Full authentication is required");

        entryPoint.commence(request, response, exception);

        assertEquals(HttpServletResponse.SC_UNAUTHORIZED, response.getStatus());
        assertTrue(response.getContentAsString().contains("401"));
        assertTrue(response.getContentAsString().contains("Unauthorized"));
    }

    @Test
    @DisplayName("CustomAccessDeniedHandler should return 403 JSON error payload")
    void accessDenied_Returns403Json() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("DELETE", "/api/admin/properties/1");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AccessDeniedException exception = new AccessDeniedException("Access Denied");

        accessDeniedHandler.handle(request, response, exception);

        assertEquals(HttpServletResponse.SC_FORBIDDEN, response.getStatus());
        assertTrue(response.getContentAsString().contains("403"));
        assertTrue(response.getContentAsString().contains("Forbidden"));
    }
}
