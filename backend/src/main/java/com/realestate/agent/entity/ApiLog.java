package com.realestate.agent.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "api_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "api_log_id")
    private Long apiLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "api_provider_id", nullable = false)
    private ApiProvider apiProvider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id")
    private Property property;

    @Column(name = "endpoint", length = 255)
    private String endpoint;

    @CreationTimestamp
    @Column(name = "request_time", updatable = false)
    private LocalDateTime requestTime;

    @Column(name = "response_time_ms")
    private Integer responseTimeMs;

    @Column(name = "status_code")
    private Integer statusCode;

    @Builder.Default
    @Column(name = "success")
    private Boolean success = true;

    @Builder.Default
    @Column(name = "retry_count")
    private Integer retryCount = 0;

    @Column(name = "response_body", columnDefinition = "jsonb")
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.JSON)
    private String responseBody;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
}
