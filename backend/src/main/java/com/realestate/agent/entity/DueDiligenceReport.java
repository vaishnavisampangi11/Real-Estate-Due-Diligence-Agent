package com.realestate.agent.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "due_diligence_reports")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DueDiligenceReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by", nullable = false)
    private User generatedBy;

    @Column(name = "report_name", nullable = false, length = 255)
    private String reportName;

    @Column(name = "executive_summary", columnDefinition = "TEXT")
    private String executiveSummary;

    @Column(name = "overall_risk_score", precision = 5, scale = 2)
    private BigDecimal overallRiskScore;

    @Builder.Default
    @Column(name = "report_status", nullable = false, length = 30)
    private String reportStatus = "GENERATED";

    @Column(name = "pdf_path", columnDefinition = "TEXT")
    private String pdfPath;

    @Column(name = "excel_path", columnDefinition = "TEXT")
    private String excelPath;

    @OneToMany(mappedBy = "report", fetch = FetchType.LAZY)
    private List<PropertyDocument> documents;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private LocalDateTime generatedAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
