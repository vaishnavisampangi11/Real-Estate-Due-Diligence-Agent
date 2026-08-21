package com.realestate.agent.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "application.security.jwt")
@Getter
@Setter
public class JwtProperties {

    private String secretKey;
    
    // Expiration time in milliseconds (e.g., 86400000 for 24 hours)
    private long expiration;
}
