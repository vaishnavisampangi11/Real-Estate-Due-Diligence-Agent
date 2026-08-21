package com.realestate.agent.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.realestate.agent.dto.LoginRequest;
import com.realestate.agent.dto.LoginResponse;
import com.realestate.agent.dto.RegisterRequest;
import com.realestate.agent.dto.RegisterResponse;
import com.realestate.agent.security.CustomAccessDeniedHandler;
import com.realestate.agent.security.CustomUserDetailsService;
import com.realestate.agent.security.JwtAuthenticationEntryPoint;
import com.realestate.agent.security.JwtAuthenticationFilter;
import com.realestate.agent.security.JwtService;
import com.realestate.agent.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class, excludeAutoConfiguration = {
        SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientWebSecurityAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

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
    @DisplayName("POST /api/auth/register should return HTTP 200 with RegisterResponse")
    void register_Success() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .firstName("Aditya")
                .lastName("Verma")
                .email("aditya@example.com")
                .password("Password123!")
                .role("BUYER")
                .build();

        RegisterResponse response = RegisterResponse.builder()
                .userId(1L)
                .firstName("Aditya")
                .lastName("Verma")
                .email("aditya@example.com")
                .message("User registered successfully")
                .build();

        when(authService.register(any(RegisterRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.email").value("aditya@example.com"))
                .andExpect(jsonPath("$.message").value("User registered successfully"));
    }

    @Test
    @DisplayName("POST /api/auth/login should return HTTP 200 with LoginResponse")
    void login_Success() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("aditya@example.com")
                .password("Password123!")
                .build();

        LoginResponse response = LoginResponse.builder()
                .token("mocked.jwt.token")
                .userId(1L)
                .firstName("Aditya")
                .lastName("Verma")
                .email("aditya@example.com")
                .role("BUYER")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.userId").value(1))
                .andExpect(jsonPath("$.role").value("BUYER"));
    }
}
