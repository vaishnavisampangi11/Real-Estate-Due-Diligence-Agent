package com.realestate.agent.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiProviderResponse {
    private Long apiProviderId;
    private String providerName;
    private String baseUrl;
    private String authenticationType;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
