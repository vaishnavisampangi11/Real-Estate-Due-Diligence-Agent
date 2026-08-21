package com.realestate.agent.service;

import com.realestate.agent.dto.UserRequest;
import com.realestate.agent.dto.UserResponse;

import java.util.List;

public interface UserService {

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long userId);

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(Long userId, UserRequest request);

    UserResponse toggleUserStatus(Long userId);

    void deleteUser(Long userId);
}
