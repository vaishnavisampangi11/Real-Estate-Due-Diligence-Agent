package com.realestate.agent.service.impl;

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
import com.realestate.agent.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Override
    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        if (StringUtils.hasText(request.getPhone()) &&
                userRepository.existsByPhone(request.getPhone())) {

            throw new ResourceAlreadyExistsException("Phone number already exists");
        }

        Role role = roleRepository.findByRoleName(request.getRole())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found: " + request.getRole()));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .isActive(true)
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        return RegisterResponse.builder()
                .userId(savedUser.getUserId())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .email(savedUser.getEmail())
                .message("User registered successfully")
                .build();
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userDetails.getUser();

        // Update last login timestamp
        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);

        String jwtToken = jwtService.generateToken(userDetails);

        return LoginResponse.builder()
                .token(jwtToken)
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().getRoleName())
                .build();
    }

    @Override
    public LoginResponse registerOAuthUser(com.realestate.agent.dto.OAuthRegisterRequest request) {
        if (!jwtService.isOAuthRegistrationTokenValid(request.getOauthToken())) {
            throw new IllegalArgumentException("The OAuth registration session has expired or is invalid. Please sign in with your social account again.");
        }

        String verifiedEmail = jwtService.extractUsername(request.getOauthToken());

        // Check if role is Administrator -> Disallow self-registration
        if ("Administrator".equalsIgnoreCase(request.getRole()) || "Admin".equalsIgnoreCase(request.getRole())) {
            throw new IllegalArgumentException("Administrator role cannot be self-registered.");
        }

        // If user already exists, update and return login response
        User user = userRepository.findByEmailWithRole(verifiedEmail).orElse(null);

        if (user == null) {
            if (StringUtils.hasText(request.getPhone()) && userRepository.existsByPhone(request.getPhone())) {
                throw new ResourceAlreadyExistsException("Phone number already exists in the system.");
            }

            Role role = roleRepository.findByRoleName(request.getRole())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

            user = User.builder()
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(verifiedEmail)
                    .phone(request.getPhone())
                    .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .role(role)
                    .isActive(true)
                    .emailVerified(true)
                    .lastLogin(java.time.LocalDateTime.now())
                    .build();

            user = userRepository.save(user);
        } else {
            user.setLastLogin(java.time.LocalDateTime.now());
            user = userRepository.save(user);
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        return LoginResponse.builder()
                .token(jwtToken)
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().getRoleName())
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public java.util.Optional<LoginResponse> processExistingOAuthUser(String email) {
        java.util.Optional<User> userOptional = userRepository.findByEmailWithRole(email);
        if (userOptional.isEmpty()) {
            return java.util.Optional.empty();
        }

        User user = userOptional.get();
        if (user.getIsActive() != null && !user.getIsActive()) {
            throw new IllegalArgumentException("Your account is currently disabled. Please contact your administrator.");
        }

        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String jwtToken = jwtService.generateToken(userDetails);

        return java.util.Optional.of(LoginResponse.builder()
                .token(jwtToken)
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().getRoleName())
                .build());
    }
}