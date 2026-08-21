package com.realestate.agent.service.impl;

import com.realestate.agent.dto.UserRequest;
import com.realestate.agent.dto.UserResponse;
import com.realestate.agent.entity.Role;
import com.realestate.agent.entity.User;
import com.realestate.agent.exception.ResourceAlreadyExistsException;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.repository.RoleRepository;
import com.realestate.agent.repository.UserRepository;
import com.realestate.agent.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        if (StringUtils.hasText(request.getPhone()) && userRepository.existsByPhone(request.getPhone())) {
            throw new ResourceAlreadyExistsException("Phone number already exists: " + request.getPhone());
        }

        String roleName = StringUtils.hasText(request.getRole()) ? request.getRole().toUpperCase() : "BUYER";
        Role role = roleRepository.findByRoleName(roleName)
                .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).isActive(true).build()));

        String rawPassword = StringUtils.hasText(request.getPassword()) ? request.getPassword() : "Password@123";

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName() != null ? request.getLastName() : "")
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .emailVerified(true)
                .build();

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (StringUtils.hasText(request.getFirstName())) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new ResourceAlreadyExistsException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (StringUtils.hasText(request.getPhone()) && !request.getPhone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(request.getPhone())) {
                throw new ResourceAlreadyExistsException("Phone already exists: " + request.getPhone());
            }
            user.setPhone(request.getPhone());
        }
        if (StringUtils.hasText(request.getRole())) {
            String roleName = request.getRole().toUpperCase();
            Role role = roleRepository.findByRoleName(roleName)
                    .orElseGet(() -> roleRepository.save(Role.builder().roleName(roleName).isActive(true).build()));
            user.setRole(role);
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        if (StringUtils.hasText(request.getPassword())) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        boolean currentActive = Boolean.TRUE.equals(user.getIsActive());
        user.setIsActive(!currentActive);

        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        userRepository.delete(user);
    }

    private UserResponse mapToResponse(User user) {
        String roleName = user.getRole() != null ? user.getRole().getRoleName() : "BUYER";
        String fullName = (user.getFirstName() != null ? user.getFirstName() : "")
                + " " + (user.getLastName() != null ? user.getLastName() : "");

        return UserResponse.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(fullName.trim())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(roleName)
                .isActive(user.getIsActive() != null ? user.getIsActive() : true)
                .emailVerified(user.getEmailVerified())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
