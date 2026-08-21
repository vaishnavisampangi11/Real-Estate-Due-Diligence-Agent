package com.realestate.agent.mapper;

import com.realestate.agent.dto.DueDiligenceReportRequest;
import com.realestate.agent.dto.DueDiligenceReportResponse;
import com.realestate.agent.entity.DueDiligenceReport;
import org.springframework.stereotype.Component;

@Component
public class DueDiligenceReportMapper {

    public DueDiligenceReport toEntity(DueDiligenceReportRequest request) {

        if (request == null) {
            return null;
        }

        return DueDiligenceReport.builder()
                .reportName(request.getReportName())
                .executiveSummary(request.getExecutiveSummary())
                .overallRiskScore(request.getOverallRiskScore())
                .reportStatus(request.getReportStatus())
                .pdfPath(request.getPdfPath())
                .excelPath(request.getExcelPath())
                .build();
    }

    public DueDiligenceReportResponse toResponse(DueDiligenceReport report) {

        if (report == null) {
            return null;
        }

        return DueDiligenceReportResponse.builder()
                .reportId(report.getReportId())
                .propertyId(report.getProperty().getPropertyId())
                .propertyName(report.getProperty().getPropertyName())
                .generatedByUserId(report.getGeneratedBy().getUserId())
                .generatedByUserEmail(report.getGeneratedBy().getEmail())
                .reportName(report.getReportName())
                .executiveSummary(report.getExecutiveSummary())
                .overallRiskScore(report.getOverallRiskScore())
                .reportStatus(report.getReportStatus())
                .pdfPath(report.getPdfPath())
                .excelPath(report.getExcelPath())
                .generatedAt(report.getGeneratedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}