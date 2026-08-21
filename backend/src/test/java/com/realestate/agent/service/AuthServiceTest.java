package com.realestate.agent.service;

import com.realestate.agent.dto.LoginRequest;
import com.realestate.agent.dto.LoginResponse;
import com.realestate.agent.dto.RegisterRequest;
import com.realestate.agent.dto.RegisterResponse;
import com.realestate.agent.entity.Role;
import com.realestate.agent.entity.User;
import com.realestate.agent.exception.ResourceAlreadyExistsException;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.repository.RoleRepository;
import com.realestate.agent.repository.UserRepository;
import com.realestate.agent.security.CustomUserDetails;
import com.realestate.agent.security.JwtService;
import com.realestate.agent.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    private Role buyerRole;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User mockUser;

    @BeforeEach
    void setUp() {
        buyerRole = Role.builder()
                .roleId(1L)
                .roleName("BUYER")
                .description("Buyer Role")
                .build();

        registerRequest = RegisterRequest.builder()
                .firstName("Aditya")
                .lastName("Verma")
                .email("aditya@example.com")
                .phone("9876543210")
                .password("Password123!")
                .role("BUYER")
                .build();

        loginRequest = LoginRequest.builder()
                .email("aditya@example.com")
                .password("Password123!")
                .build();

        mockUser = User.builder()
                .userId(101L)
                .firstName("Aditya")
                .lastName("Verma")
                .email("aditya@example.com")
                .phone("9876543210")
                .passwordHash("encoded_password")
                .role(buyerRole)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Should successfully register a new user")
    void register_Success() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(registerRequest.getPhone())).thenReturn(false);
        when(roleRepository.findByRoleName("BUYER")).thenReturn(Optional.of(buyerRole));
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        RegisterResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals(101L, response.getUserId());
        assertEquals("aditya@example.com", response.getEmail());
        assertEquals("User registered successfully", response.getMessage());

        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw ResourceAlreadyExistsException on duplicate email registration")
    void register_DuplicateEmail_ThrowsException() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

        assertThrows(ResourceAlreadyExistsException.class, () -> authService.register(registerRequest));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when role does not exist")
    void register_InvalidRole_ThrowsException() {
        when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByPhone(registerRequest.getPhone())).thenReturn(false);
        when(roleRepository.findByRoleName("BUYER")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.register(registerRequest));
    }

    @Test
    @DisplayName("Should successfully authenticate and return JWT token on login")
    void login_Success() {
        CustomUserDetails userDetails = new CustomUserDetails(mockUser);
        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(jwtService.generateToken(userDetails)).thenReturn("mock.jwt.token");

        LoginResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals(101L, response.getUserId());
        assertEquals("BUYER", response.getRole());
        verify(userRepository, times(1)).save(mockUser);
    }

    @Test
    @DisplayName("Should successfully register new user via OAuth token")
    void registerOAuthUser_Success() {
        com.realestate.agent.dto.OAuthRegisterRequest oauthReq = com.realestate.agent.dto.OAuthRegisterRequest.builder()
                .oauthToken("valid.oauth.token")
                .firstName("OAuth")
                .lastName("User")
                .phone("9876543210")
                .role("Buyer")
                .build();

        when(jwtService.isOAuthRegistrationTokenValid("valid.oauth.token")).thenReturn(true);
        when(jwtService.extractUsername("valid.oauth.token")).thenReturn("oauthuser@gmail.com");
        when(userRepository.findByEmailWithRole("oauthuser@gmail.com")).thenReturn(Optional.empty());
        when(userRepository.existsByPhone("9876543210")).thenReturn(false);
        when(roleRepository.findByRoleName("Buyer")).thenReturn(Optional.of(buyerRole));
        when(passwordEncoder.encode(any(String.class))).thenReturn("hashed_pass");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("oauth.jwt.token");

        LoginResponse response = authService.registerOAuthUser(oauthReq);

        assertNotNull(response);
        assertEquals("oauth.jwt.token", response.getToken());
        assertEquals(101L, response.getUserId());
    }

    @Test
    @DisplayName("Should reject Administrator self-registration via OAuth")
    void registerOAuthUser_AdminRole_ThrowsException() {
        com.realestate.agent.dto.OAuthRegisterRequest oauthReq = com.realestate.agent.dto.OAuthRegisterRequest.builder()
                .oauthToken("valid.oauth.token")
                .firstName("Admin")
                .lastName("Attempt")
                .phone("9876543210")
                .role("Administrator")
                .build();

        when(jwtService.isOAuthRegistrationTokenValid("valid.oauth.token")).thenReturn(true);
        when(jwtService.extractUsername("valid.oauth.token")).thenReturn("admin@attempt.com");

        assertThrows(IllegalArgumentException.class, () -> authService.registerOAuthUser(oauthReq));
    }

    @Test
    @DisplayName("Should successfully process existing OAuth user login")
    void processExistingOAuthUser_Success() {
        when(userRepository.findByEmailWithRole("existing@gmail.com")).thenReturn(Optional.of(mockUser));
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("existing.jwt.token");

        Optional<LoginResponse> response = authService.processExistingOAuthUser("existing@gmail.com");

        assertTrue(response.isPresent());
        assertEquals("existing.jwt.token", response.get().getToken());
        assertEquals(101L, response.get().getUserId());
        assertEquals("BUYER", response.get().getRole());
        verify(userRepository, times(1)).save(mockUser);
    }

    @Test
    @DisplayName("Should return empty Optional when OAuth user does not exist in DB")
    void processExistingOAuthUser_NotFound_ReturnsEmpty() {
        when(userRepository.findByEmailWithRole("unknown@gmail.com")).thenReturn(Optional.empty());

        Optional<LoginResponse> response = authService.processExistingOAuthUser("unknown@gmail.com");

        assertTrue(response.isEmpty());
    }
}
