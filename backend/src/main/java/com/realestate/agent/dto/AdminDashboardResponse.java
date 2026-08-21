package com.realestate.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    private long totalUsers;
    private long activeUsers;
    private long totalProperties;
    private long totalReports;
    private long totalRiskAssessments;
    private long totalAuditLogs;
    private long activeSessions;
    private double systemHealth;
    private long todayApiRequests;

    private List<DueDiligenceReportResponse> recentReports;
    private List<UserResponse> recentUsers;
    private List<RoleDistributionDTO> roleDistribution;
    private List<UserGrowthDTO> userGrowth;
}