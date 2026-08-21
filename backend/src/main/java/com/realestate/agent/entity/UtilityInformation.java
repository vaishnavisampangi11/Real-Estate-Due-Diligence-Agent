package com.realestate.agent.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "utility_information")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UtilityInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "utility_id")
    private Long utilityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "utility_type", length = 50)
    private String utilityType;

    @Column(name = "provider_name", length = 150)
    private String providerName;

    @Column(name = "connection_status", length = 30)
    private String connectionStatus;

    @Column(name = "account_reference", length = 100)
    private String accountReference;

    @Column(name = "last_bill_date")
    private LocalDate lastBillDate;

    @Column(name = "provider_contact", length = 100)
    private String providerContact;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
