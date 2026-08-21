package com.realestate.agent.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilityInformationResponse {
    private Long utilityId;
    private Long propertyId;
    private String propertyName;
    private String utilityType;
    private String providerName;
    private String connectionStatus;
    private String accountReference;
    private LocalDate lastBillDate;
    private String providerContact;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
