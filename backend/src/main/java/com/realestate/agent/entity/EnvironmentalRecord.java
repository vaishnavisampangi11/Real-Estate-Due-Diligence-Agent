package com.realestate.agent.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "environmental_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnvironmentalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "environmental_id")
    private Long environmentalId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "record_type", length = 100)
    private String recordType;

    @Column(name = "risk_level", length = 30)
    private String riskLevel;

    @Column(name = "issuing_authority", length = 150)
    private String issuingAuthority;

    @Column(name = "report_date")
    private LocalDate reportDate;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "report_url", columnDefinition = "TEXT")
    private String reportUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
