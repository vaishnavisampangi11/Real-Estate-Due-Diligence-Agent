package com.realestate.agent.entity;

import com.realestate.agent.enums.ListingStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "property_listings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "listing_id")
    private Long listingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "listing_source", length = 100)
    private String listingSource;

    @Column(name = "listing_url", columnDefinition = "TEXT")
    private String listingUrl;

    @Column(name = "listing_price", precision = 18, scale = 2)
    private BigDecimal listingPrice;

    @Column(name = "listing_date")
    private LocalDate listingDate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "listing_status", nullable = false, length = 30)
    private ListingStatus listingStatus = ListingStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
