package com.realestate.agent.service;

import com.realestate.agent.dto.DueDiligenceReportRequest;
import com.realestate.agent.dto.DueDiligenceReportResponse;
import com.realestate.agent.entity.DueDiligenceReport;
import com.realestate.agent.entity.Property;
import com.realestate.agent.entity.User;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.ReportMapper;
import com.realestate.agent.repository.DueDiligenceReportRepository;
import com.realestate.agent.repository.PropertyDocumentRepository;
import com.realestate.agent.repository.PropertyRepository;
import com.realestate.agent.repository.UserRepository;
import com.realestate.agent.service.impl.ReportServiceImpl;
import com.realestate.agent.util.ExcelGenerator;
import com.realestate.agent.util.PdfGenerator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private DueDiligenceReportRepository reportRepository;

    @Mock
    private PropertyDocumentRepository documentRepository;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReportMapper reportMapper;

    @Mock
    private RiskService riskService;

    @Mock
    private ComparablePropertyService comparablePropertyService;

    @Mock
    private PropertyValuationService propertyValuationService;

    @Mock
    private PdfGenerator pdfGenerator;

    @Mock
    private ExcelGenerator excelGenerator;

    @InjectMocks
    private ReportServiceImpl reportService;

    private Property mockProperty;
    private User mockUser;
    private DueDiligenceReport mockReport;
    private DueDiligenceReportResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockProperty = Property.builder()
                .propertyId(1L)
                .propertyCode("PROP-001")
                .propertyName("Gachibowli Villa")
                .build();

        mockUser = User.builder()
                .userId(10L)
                .email("analyst@example.com")
                .build();

        mockReport = DueDiligenceReport.builder()
                .reportId(500L)
                .property(mockProperty)
                .generatedBy(mockUser)
                .overallRiskScore(new BigDecimal("14.00"))
                .executiveSummary("Comprehensive due diligence verified low risk.")
                .build();

        mockResponse = DueDiligenceReportResponse.builder()
                .reportId(500L)
                .propertyId(1L)
                .propertyName("Gachibowli Villa")
                .overallRiskScore(new BigDecimal("14.00"))
                .executiveSummary("Comprehensive due diligence verified low risk.")
                .build();
    }

    @Test
    @DisplayName("Should successfully retrieve report by ID")
    void getReportById_Success() {
        when(reportRepository.findById(500L)).thenReturn(Optional.of(mockReport));
        when(reportMapper.toReportResponse(mockReport)).thenReturn(mockResponse);

        DueDiligenceReportResponse response = reportService.getReportById(500L);

        assertNotNull(response);
        assertEquals(500L, response.getReportId());
        assertEquals(new BigDecimal("14.00"), response.getOverallRiskScore());
        assertEquals("Gachibowli Villa", response.getPropertyName());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when report ID does not exist")
    void getReportById_NotFound_ThrowsException() {
        when(reportRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reportService.getReportById(999L));
    }

    @Test
    @DisplayName("Should retrieve reports by property ID")
    void getReportsByProperty_Success() {
        when(propertyRepository.existsById(1L)).thenReturn(true);
        when(reportRepository.findByPropertyPropertyId(1L)).thenReturn(List.of(mockReport));
        when(reportMapper.toReportResponse(mockReport)).thenReturn(mockResponse);

        List<DueDiligenceReportResponse> reports = reportService.getReportsByProperty(1L);

        assertNotNull(reports);
        assertEquals(1, reports.size());
        assertEquals(500L, reports.get(0).getReportId());
    }
}
