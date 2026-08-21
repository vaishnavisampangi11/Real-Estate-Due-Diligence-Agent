package com.realestate.agent.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyTaxRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotNull(message = "Tax year is required")
    @Min(value = 1800, message = "Tax year must be valid")
    private Integer taxYear;

    @PositiveOrZero(message = "Assessed value must be positive or zero")
    private BigDecimal assessedValue;

    @NotNull(message = "Tax amount is required")
    @PositiveOrZero(message = "Tax amount must be positive or zero")
    private BigDecimal taxAmount;

    @PositiveOrZero(message = "Due amount must be positive or zero")
    private BigDecimal dueAmount;

    @PositiveOrZero(message = "Paid amount must be positive or zero")
    private BigDecimal paidAmount;

    @NotBlank(message = "Payment status is required")
    private String paymentStatus;

    private LocalDate paymentDate;

    private String taxReceiptNumber;

    private String taxAuthority;
}
