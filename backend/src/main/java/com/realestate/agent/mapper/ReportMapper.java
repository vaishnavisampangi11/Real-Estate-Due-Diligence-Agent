package com.realestate.agent.mapper;

import com.realestate.agent.dto.DueDiligenceReportRequest;
import com.realestate.agent.dto.DueDiligenceReportResponse;
import com.realestate.agent.dto.PropertyDocumentRequest;
import com.realestate.agent.dto.PropertyDocumentResponse;
import com.realestate.agent.entity.DueDiligenceReport;
import com.realestate.agent.entity.PropertyDocument;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {

    public DueDiligenceReportResponse toReportResponse(DueDiligenceReport report) {
        if (report == null) {
            return null;
        }
        return DueDiligenceReportResponse.builder()
                .reportId(report.getReportId())
                .propertyId(report.getProperty() != null ? report.getProperty().getPropertyId() : null)
                .propertyName(report.getProperty() != null ? report.getProperty().getPropertyName() : null)
                .generatedByUserId(report.getGeneratedBy() != null ? report.getGeneratedBy().getUserId() : null)
                .generatedByUserEmail(report.getGeneratedBy() != null ? report.getGeneratedBy().getEmail() : null)
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

    public DueDiligenceReport toReportEntity(DueDiligenceReportRequest request) {
        if (request == null) {
            return null;
        }
        return DueDiligenceReport.builder()
                .reportName(request.getReportName())
                .executiveSummary(request.getExecutiveSummary())
                .overallRiskScore(request.getOverallRiskScore())
                .reportStatus(request.getReportStatus() != null ? request.getReportStatus() : "GENERATED")
                .pdfPath(request.getPdfPath())
                .excelPath(request.getExcelPath())
                .build();
    }

    public void updateReportFromRequest(DueDiligenceReportRequest request, DueDiligenceReport report) {
        if (request == null || report == null) {
            return;
        }
        report.setReportName(request.getReportName());
        report.setExecutiveSummary(request.getExecutiveSummary());
        report.setOverallRiskScore(request.getOverallRiskScore());
        if (request.getReportStatus() != null) {
            report.setReportStatus(request.getReportStatus());
        }
        report.setPdfPath(request.getPdfPath());
        report.setExcelPath(request.getExcelPath());
    }

    public PropertyDocumentResponse toDocumentResponse(PropertyDocument doc) {
        if (doc == null) {
            return null;
        }
        return PropertyDocumentResponse.builder()
                .documentId(doc.getDocumentId())
                .propertyId(doc.getProperty() != null ? doc.getProperty().getPropertyId() : null)
                .propertyName(doc.getProperty() != null ? doc.getProperty().getPropertyName() : null)
                .reportId(doc.getReport() != null ? doc.getReport().getReportId() : null)
                .reportName(doc.getReport() != null ? doc.getReport().getReportName() : null)
                .documentType(doc.getDocumentType())
                .documentName(doc.getDocumentName())
                .filePath(doc.getFilePath())
                .fileFormat(doc.getFileFormat())
                .uploadedByUserId(doc.getUploadedBy() != null ? doc.getUploadedBy().getUserId() : null)
                .uploadedByUserEmail(doc.getUploadedBy() != null ? doc.getUploadedBy().getEmail() : null)
                .uploadedAt(doc.getUploadedAt())
                .build();
    }

    public PropertyDocument toDocumentEntity(PropertyDocumentRequest request) {
        if (request == null) {
            return null;
        }
        return PropertyDocument.builder()
                .documentType(request.getDocumentType())
                .documentName(request.getDocumentName())
                .filePath(request.getFilePath())
                .fileFormat(request.getFileFormat())
                .build();
    }

    public void updateDocumentFromRequest(PropertyDocumentRequest request, PropertyDocument doc) {
        if (request == null || doc == null) {
            return;
        }
        doc.setDocumentType(request.getDocumentType());
        doc.setDocumentName(request.getDocumentName());
        doc.setFilePath(request.getFilePath());
        doc.setFileFormat(request.getFileFormat());
    }
}
