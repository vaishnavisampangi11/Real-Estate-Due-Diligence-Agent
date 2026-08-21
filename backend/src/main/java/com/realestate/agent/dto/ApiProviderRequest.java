package com.realestate.agent.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiProviderRequest {

    @NotBlank(message = "Provider name is required")
    private String providerName;

    private String baseUrl;

    private String authenticationType;

    @Builder.Default
    private Boolean isActive = true;
}
