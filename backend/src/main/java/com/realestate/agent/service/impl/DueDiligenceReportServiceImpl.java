package com.realestate.agent.service.impl;

import com.realestate.agent.dto.DueDiligenceReportRequest;
import com.realestate.agent.dto.DueDiligenceReportResponse;
import com.realestate.agent.entity.DueDiligenceReport;
import com.realestate.agent.entity.Property;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.DueDiligenceReportMapper;
import com.realestate.agent.repository.DueDiligenceReportRepository;
import com.realestate.agent.repository.PropertyRepository;
import com.realestate.agent.service.DueDiligenceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DueDiligenceReportServiceImpl implements DueDiligenceReportService {

    private final DueDiligenceReportRepository reportRepository;
    private final PropertyRepository propertyRepository;
    private final DueDiligenceReportMapper reportMapper;

    public DueDiligenceReportServiceImpl(
            DueDiligenceReportRepository reportRepository,
            PropertyRepository propertyRepository,
            DueDiligenceReportMapper reportMapper
    ) {
        this.reportRepository = reportRepository;
        this.propertyRepository = propertyRepository;
        this.reportMapper = reportMapper;
    }

    @Override
    public DueDiligenceReportResponse generateReport(
            DueDiligenceReportRequest request) {

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Property not found with ID: " + request.getPropertyId()));

        DueDiligenceReport report =
                reportMapper.toEntity(request);

        report.setProperty(property);

        DueDiligenceReport savedReport =
                reportRepository.save(report);

        return reportMapper.toResponse(savedReport);
    }

    @Override
    @Transactional(readOnly = true)
    public DueDiligenceReportResponse getReportById(Long reportId) {

        DueDiligenceReport report =
                reportRepository.findById(reportId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Report not found with ID: " + reportId));

        return reportMapper.toResponse(report);
    }
}