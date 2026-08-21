package com.realestate.agent.service;

import com.realestate.agent.dto.LoginRequest;
import com.realestate.agent.dto.LoginResponse;
import com.realestate.agent.dto.RegisterRequest;
import com.realestate.agent.dto.RegisterResponse;
import com.realestate.agent.dto.OAuthRegisterRequest;

import java.util.Optional;

public interface AuthService {

    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    LoginResponse registerOAuthUser(OAuthRegisterRequest request);

    Optional<LoginResponse> processExistingOAuthUser(String email);

}