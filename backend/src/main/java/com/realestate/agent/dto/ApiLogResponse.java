package com.realestate.agent.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiLogResponse {
    private Long apiLogId;
    private Long apiProviderId;
    private String apiProviderName;
    private Long propertyId;
    private String propertyName;
    private String endpoint;
    private LocalDateTime requestTime;
    private Integer responseTimeMs;
    private Integer statusCode;
    private Boolean success;
    private Integer retryCount;
    private String responseBody;
    private String errorMessage;
}
