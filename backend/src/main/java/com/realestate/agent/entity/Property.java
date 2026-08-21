package com.realestate.agent.entity;

import com.realestate.agent.enums.PropertyStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "property_code", nullable = false, unique = true, length = 30)
    private String propertyCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_type_id", nullable = false)
    private PropertyType propertyType;

    @Column(name = "property_name", nullable = false, length = 200)
    private String propertyName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "built_year")
    private Integer builtYear;

    @Column(name = "total_area", precision = 12, scale = 2)
    private BigDecimal totalArea;

    @Column(name = "land_area", precision = 12, scale = 2)
    private BigDecimal landArea;

    @Column(name = "market_value", precision = 18, scale = 2)
    private BigDecimal marketValue;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PropertyStatus status = PropertyStatus.UNDER_REVIEW;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Address> addresses;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PropertyListing> listings;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
