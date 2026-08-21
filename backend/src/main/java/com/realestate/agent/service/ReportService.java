package com.realestate.agent.service;

import com.realestate.agent.dto.DueDiligenceReportRequest;
import com.realestate.agent.dto.DueDiligenceReportResponse;
import com.realestate.agent.dto.PropertyDocumentRequest;
import com.realestate.agent.dto.PropertyDocumentResponse;

import java.util.List;

public interface ReportService {

    // Report CRUD Operations
    DueDiligenceReportResponse generateReport(DueDiligenceReportRequest request, String userEmail);
    DueDiligenceReportResponse getReportById(Long id);
    List<DueDiligenceReportResponse> getReportsByProperty(Long propertyId);
    List<DueDiligenceReportResponse> getMyReports(Long currentUserId);
    DueDiligenceReportResponse updateReport(Long id, DueDiligenceReportRequest request);
    void deleteReport(Long id);

    // Property Document CRUD Operations
    PropertyDocumentResponse uploadDocument(PropertyDocumentRequest request, String userEmail);
    PropertyDocumentResponse getDocumentById(Long id);
    List<PropertyDocumentResponse> getAllDocuments();
    List<PropertyDocumentResponse> getDocumentsByProperty(Long propertyId);
    List<PropertyDocumentResponse> getDocumentsByReport(Long reportId);
    PropertyDocumentResponse updateDocument(Long id, PropertyDocumentRequest request);
    void deleteDocument(Long id);

    byte[] exportPdf(Long reportId);

    byte[] exportExcel(Long reportId);
}
