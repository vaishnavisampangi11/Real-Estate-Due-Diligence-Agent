package com.realestate.agent.service.impl;

import com.realestate.agent.dto.AdminDashboardResponse;
import com.realestate.agent.dto.DueDiligenceReportResponse;
import com.realestate.agent.dto.RoleDistributionDTO;
import com.realestate.agent.dto.UserGrowthDTO;
import com.realestate.agent.dto.UserResponse;
import com.realestate.agent.entity.User;
import com.realestate.agent.repository.ApiLogRepository;
import com.realestate.agent.repository.AuditLogRepository;
import com.realestate.agent.repository.DueDiligenceReportRepository;
import com.realestate.agent.repository.PropertyRepository;
import com.realestate.agent.repository.RiskAssessmentRepository;
import com.realestate.agent.repository.UserRepository;
import com.realestate.agent.service.AdminDashboardService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final DueDiligenceReportRepository dueDiligenceReportRepository;
    private final RiskAssessmentRepository riskAssessmentRepository;
    private final AuditLogRepository auditLogRepository;
    private final ApiLogRepository apiLogRepository;

    public AdminDashboardServiceImpl(
            UserRepository userRepository,
            PropertyRepository propertyRepository,
            DueDiligenceReportRepository dueDiligenceReportRepository,
            RiskAssessmentRepository riskAssessmentRepository,
            AuditLogRepository auditLogRepository,
            ApiLogRepository apiLogRepository
    ) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.dueDiligenceReportRepository = dueDiligenceReportRepository;
        this.riskAssessmentRepository = riskAssessmentRepository;
        this.auditLogRepository = auditLogRepository;
        this.apiLogRepository = apiLogRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardAnalytics() {

        long totalUsers = userRepository.count();

        // Active Users: count where is_active is true or defaults to true
        long activeUsers = userRepository.findAll().stream()
                .filter(u -> u.getIsActive() == null || u.getIsActive())
                .count();

        long totalProperties = propertyRepository.count();

        long totalReports = dueDiligenceReportRepository.count();

        long totalRiskAssessments = riskAssessmentRepository.count();

        long totalAuditLogs = auditLogRepository.count();

        // Active Sessions: logged in within last 24 hours
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        long activeSessions = userRepository.findAll().stream()
                .filter(u -> u.getLastLogin() != null && u.getLastLogin().isAfter(oneDayAgo))
                .count();

        double systemHealth = 99.98;

        long todayApiRequests = apiLogRepository.count();

        // Fetch recent reports (top 3)
        List<DueDiligenceReportResponse> recentReports = dueDiligenceReportRepository.findAll(
                PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "generatedAt"))
        ).getContent().stream()
                .map(r -> DueDiligenceReportResponse.builder()
                        .reportId(r.getReportId())
                        .propertyId(r.getProperty().getPropertyId())
                        .propertyName(r.getProperty().getPropertyName())
                        .generatedByUserId(r.getGeneratedBy().getUserId())
                        .generatedByUserEmail(r.getGeneratedBy().getEmail())
                        .reportName(r.getReportName())
                        .reportStatus(r.getReportStatus())
                        .overallRiskScore(r.getOverallRiskScore())
                        .generatedAt(r.getGeneratedAt())
                        .build())
                .collect(Collectors.toList());

        // Fetch recent users (top 3)
        List<UserResponse> recentUsers = userRepository.findAll(
                PageRequest.of(0, 3, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent().stream()
                .map(u -> UserResponse.builder()
                        .userId(u.getUserId())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .role(u.getRole().getRoleName())
                        .isActive(u.getIsActive())
                        .lastLogin(u.getLastLogin())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        // Role distribution counts
        Map<String, Long> roleCounts = new HashMap<>();
        userRepository.findAll().forEach(u -> {
            String roleName = u.getRole().getRoleName();
            roleCounts.put(roleName, roleCounts.getOrDefault(roleName, 0L) + 1);
        });

        List<RoleDistributionDTO> roleDistribution = new ArrayList<>();
        Map<String, String> roleColors = Map.of(
                "Buyer", "#3B82F6",
                "Real Estate Agent", "#8B5CF6",
                "Legal Reviewer", "#F59E0B",
                "Financial Institution", "#10B981",
                "Administrator", "#EF4444"
        );

        roleCounts.forEach((roleName, count) -> {
            String color = roleColors.getOrDefault(roleName, "#64748B");
            roleDistribution.add(new RoleDistributionDTO(roleName, count, color));
        });

        // Monthly user growth for the last 6 months
        List<UserGrowthDTO> userGrowth = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        List<User> allUsers = userRepository.findAll();
        
        for (int i = 5; i >= 0; i--) {
            LocalDateTime monthDate = now.minusMonths(i);
            String monthName = monthDate.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            
            // Total cumulative users up to the end of that month
            LocalDateTime endOfMonth = monthDate.withDayOfMonth(monthDate.toLocalDate().lengthOfMonth())
                    .withHour(23).withMinute(59).withSecond(59);
            
            long usersCount = allUsers.stream()
                    .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isBefore(endOfMonth))
                    .count();
            
            userGrowth.add(new UserGrowthDTO(monthName, usersCount));
        }

        return new AdminDashboardResponse(
                totalUsers,
                activeUsers,
                totalProperties,
                totalReports,
                totalRiskAssessments,
                totalAuditLogs,
                activeSessions,
                systemHealth,
                todayApiRequests,
                recentReports,
                recentUsers,
                roleDistribution,
                userGrowth
        );
    }
}