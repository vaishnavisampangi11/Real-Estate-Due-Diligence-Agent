package com.realestate.agent.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyTaxResponse {
    private Long taxId;
    private Long propertyId;
    private String propertyName;
    private Integer taxYear;
    private BigDecimal assessedValue;
    private BigDecimal taxAmount;
    private BigDecimal dueAmount;
    private BigDecimal paidAmount;
    private String paymentStatus;
    private LocalDate paymentDate;
    private String taxReceiptNumber;
    private String taxAuthority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
