package com.realestate.agent.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UtilityInformationRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    private String utilityType;

    private String providerName;

    private String connectionStatus;

    private String accountReference;

    private LocalDate lastBillDate;

    private String providerContact;
}
