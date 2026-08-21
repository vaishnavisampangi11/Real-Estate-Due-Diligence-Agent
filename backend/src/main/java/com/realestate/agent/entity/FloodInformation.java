package com.realestate.agent.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "flood_information")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloodInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "flood_id")
    private Long floodId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "flood_zone", length = 30)
    private String floodZone;

    @Column(name = "flood_risk_level", length = 30)
    private String floodRiskLevel;

    @Builder.Default
    @Column(name = "insurance_required")
    private Boolean insuranceRequired = false;

    @Column(name = "last_verified")
    private LocalDate lastVerified;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
