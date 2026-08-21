package com.realestate.agent.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "zoning_information")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZoningInformation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "zoning_id")
    private Long zoningId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "zone_code", length = 50)
    private String zoneCode;

    @Column(name = "zone_name", length = 150)
    private String zoneName;

    @Column(name = "land_use", length = 100)
    private String landUse;

    @Column(name = "max_building_height", precision = 8, scale = 2)
    private BigDecimal maxBuildingHeight;

    @Column(name = "floor_area_ratio", precision = 6, scale = 2)
    private BigDecimal floorAreaRatio;

    @Builder.Default
    @Column(name = "compliance_status")
    private Boolean complianceStatus = true;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
