package com.realestate.agent.service;

import com.realestate.agent.dto.DueDiligenceReportRequest;
import com.realestate.agent.dto.DueDiligenceReportResponse;

public interface DueDiligenceReportService {

    DueDiligenceReportResponse generateReport(DueDiligenceReportRequest request);

    DueDiligenceReportResponse getReportById(Long reportId);

}