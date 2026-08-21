package com.realestate.agent.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "property_taxes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyTax {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tax_id")
    private Long taxId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "tax_year", nullable = false)
    private Integer taxYear;

    @Column(name = "assessed_value", precision = 18, scale = 2)
    private BigDecimal assessedValue;

    @Column(name = "tax_amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal taxAmount;

    @Builder.Default
    @Column(name = "due_amount", precision = 18, scale = 2)
    private BigDecimal dueAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "paid_amount", precision = 18, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "payment_status", length = 20)
    private String paymentStatus = "PENDING";

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "tax_receipt_number", length = 100)
    private String taxReceiptNumber;

    @Column(name = "tax_authority", length = 150)
    private String taxAuthority;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
