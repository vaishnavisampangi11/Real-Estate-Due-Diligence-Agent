package com.realestate.agent.security;

import com.realestate.agent.dto.LoginResponse;
import com.realestate.agent.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthService authService;
    private final JwtService jwtService;

    @Value("${application.frontend.redirect-uri:http://localhost:5174/oauth2/redirect}")
    private String frontendRedirectUri;

    @Value("${application.frontend.login-uri:http://localhost:5174/login}")
    private String frontendLoginUri;

    @Value("${application.frontend.complete-oauth-registration-uri:http://localhost:5174/complete-oauth-registration}")
    private String frontendCompleteRegistrationUri;

    public OAuth2AuthenticationSuccessHandler(@Lazy AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        String email = null;
        String firstName = null;
        String lastName = null;
        String provider = "google";

        if (authentication instanceof OAuth2AuthenticationToken authToken) {
            provider = authToken.getAuthorizedClientRegistrationId();
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof OidcUser oidcUser) {
            email = oidcUser.getEmail();
            firstName = oidcUser.getGivenName();
            lastName = oidcUser.getFamilyName();
            if (firstName == null && oidcUser.getFullName() != null) {
                String[] parts = oidcUser.getFullName().split(" ", 2);
                firstName = parts[0];
                lastName = parts.length > 1 ? parts[1] : "";
            }
        } else if (principal instanceof OAuth2User oauth2User) {
            email = oauth2User.getAttribute("email");
            if (email == null) {
                email = oauth2User.getAttribute("preferred_username");
            }
            if (email == null) {
                email = oauth2User.getAttribute("userPrincipalName");
            }
            firstName = oauth2User.getAttribute("given_name");
            lastName = oauth2User.getAttribute("family_name");
            if (firstName == null && oauth2User.getAttribute("name") != null) {
                String fullName = oauth2User.getAttribute("name");
                String[] parts = fullName.split(" ", 2);
                firstName = parts[0];
                lastName = parts.length > 1 ? parts[1] : "";
            }
        }

        if (email == null || email.isBlank()) {
            String targetUrl = UriComponentsBuilder.fromUriString(frontendLoginUri)
                    .queryParam("error", URLEncoder.encode("Email address could not be obtained from " + provider + ".", StandardCharsets.UTF_8))
                    .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
            return;
        }

        try {
            // STEP 1 — Check if user exists in PostgreSQL via active transactional persistence context
            Optional<LoginResponse> loginResponseOptional = authService.processExistingOAuthUser(email);

            if (loginResponseOptional.isPresent()) {
                // Existing registered user: login immediately using existing database role
                LoginResponse loginResponse = loginResponseOptional.get();

                String targetUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri)
                        .queryParam("token", loginResponse.getToken())
                        .build().toUriString();

                clearAuthenticationAttributes(request);
                getRedirectStrategy().sendRedirect(request, response, targetUrl);
            } else {
                // STEP 2 — Unregistered user: Redirect to Complete Registration page with verified details
                String oauthToken = jwtService.generateOAuthRegistrationToken(email, firstName, lastName, provider);

                String targetUrl = UriComponentsBuilder.fromUriString(frontendCompleteRegistrationUri)
                        .queryParam("oauthToken", oauthToken)
                        .queryParam("email", email)
                        .queryParam("firstName", firstName != null ? firstName : "")
                        .queryParam("lastName", lastName != null ? lastName : "")
                        .queryParam("provider", provider)
                        .build().toUriString();

                clearAuthenticationAttributes(request);
                getRedirectStrategy().sendRedirect(request, response, targetUrl);
            }
        } catch (Exception ex) {
            String targetUrl = UriComponentsBuilder.fromUriString(frontendLoginUri)
                    .queryParam("error", URLEncoder.encode(ex.getMessage(), StandardCharsets.UTF_8))
                    .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        }
    }
}
