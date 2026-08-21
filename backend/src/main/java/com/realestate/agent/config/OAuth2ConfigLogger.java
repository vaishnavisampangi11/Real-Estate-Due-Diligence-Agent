package com.realestate.agent.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Component;

@Component
public class OAuth2ConfigLogger implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(OAuth2ConfigLogger.class);
    private final ClientRegistrationRepository clientRegistrationRepository;

    public OAuth2ConfigLogger(ClientRegistrationRepository clientRegistrationRepository) {
        this.clientRegistrationRepository = clientRegistrationRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        ClientRegistration google = clientRegistrationRepository.findByRegistrationId("google");
        if (google != null) {
            String clientId = google.getClientId();
            String clientSecret = google.getClientSecret();

            boolean hasClientId = clientId != null && !clientId.isBlank() && !clientId.contains("placeholder");
            boolean matchesExpectedClientId = "342328203507-3hs5jq2hk17ccimncsn9n4g3q3rk8pho.apps.googleusercontent.com".equals(clientId);
            boolean hasClientSecret = clientSecret != null && !clientSecret.isBlank() && !clientSecret.contains("placeholder");
            boolean secretStartsWithGocspx = clientSecret != null && clientSecret.startsWith("GOCSPX-");
            boolean secretHasWhitespace = clientSecret != null && (clientSecret.contains(" ") || clientSecret.contains("\t") || clientSecret.contains("\n") || clientSecret.contains("\r"));

            log.info("OAuth2 Runtime Verification [google] ->");
            log.info("  GOOGLE_CLIENT_ID configured: {} (matches expected: {}, length: {})",
                    hasClientId, matchesExpectedClientId, clientId != null ? clientId.length() : 0);
            log.info("  GOOGLE_CLIENT_SECRET configured: {} (length: {}, startsWith 'GOCSPX-': {}, contains whitespace: {})",
                    hasClientSecret, clientSecret != null ? clientSecret.length() : 0, secretStartsWithGocspx, secretHasWhitespace);
            log.info("  Auth Method: {}, Token URI: {}, Redirect Template: {}",
                    google.getClientAuthenticationMethod() != null ? google.getClientAuthenticationMethod().getValue() : "default",
                    google.getProviderDetails() != null ? google.getProviderDetails().getTokenUri() : "default",
                    google.getRedirectUri());
        } else {
            log.warn("OAuth2 Registration [google] is NOT registered in ClientRegistrationRepository");
        }
    }
}