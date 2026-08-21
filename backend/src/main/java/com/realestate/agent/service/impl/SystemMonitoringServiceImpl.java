package com.realestate.agent.service.impl;

import com.realestate.agent.dto.SystemMonitoringResponse;
import com.realestate.agent.service.SystemMonitoringService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringBootVersion;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

@Service
public class SystemMonitoringServiceImpl implements SystemMonitoringService {

    private final DataSource dataSource;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    public SystemMonitoringServiceImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public SystemMonitoringResponse getSystemTelemetry() {
        long reqStart = System.currentTimeMillis();

        // 1. Backend / JVM Runtime Metrics
        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        long startTime = ManagementFactory.getRuntimeMXBean().getStartTime();
        String javaVer = System.getProperty("java.version", "Unknown");
        String springVer = SpringBootVersion.getVersion();
        String frameworkStr = "Spring Boot " + (springVer != null ? springVer : "3.5.16");

        // 2. Database Connectivity & Query Latency
        long dbStart = System.currentTimeMillis();
        String pgVersion = "PostgreSQL";
        String dbStatus = "Operational";
        String dbConn = "Connected";
        long dbLatency = 0;

        try (Connection conn = dataSource.getConnection()) {
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT version()")) {
                if (rs.next()) {
                    String fullVer = rs.getString(1);
                    if (fullVer != null && fullVer.contains("PostgreSQL")) {
                        // Extract concise version like "PostgreSQL 18.3" or full prefix
                        int commaIdx = fullVer.indexOf(",");
                        pgVersion = commaIdx > 0 ? fullVer.substring(0, commaIdx) : fullVer;
                    } else {
                        pgVersion = fullVer;
                    }
                }
            }
            dbLatency = Math.max(1, System.currentTimeMillis() - dbStart);
        } catch (Exception ex) {
            dbStatus = "Unavailable";
            dbConn = "Disconnected";
            pgVersion = "PostgreSQL (Connection Failed)";
            dbLatency = 0;
        }

        // 3. JVM Memory Metrics
        Runtime runtime = Runtime.getRuntime();
        long totalMemory = runtime.totalMemory();
        long freeMemory = runtime.freeMemory();
        long usedMemory = totalMemory - freeMemory;
        long maxMemory = runtime.maxMemory();

        double usedGb = Math.round(((double) usedMemory / (1024.0 * 1024.0 * 1024.0)) * 100.0) / 100.0;
        double totalGb = Math.round(((double) totalMemory / (1024.0 * 1024.0 * 1024.0)) * 100.0) / 100.0;
        double maxGb = Math.round(((double) maxMemory / (1024.0 * 1024.0 * 1024.0)) * 100.0) / 100.0;
        double memPercentage = maxMemory > 0 ? Math.round(((double) usedMemory / (double) maxMemory * 100.0) * 10.0) / 10.0 : 0.0;

        // 4. CPU & Processors
        int processors = Runtime.getRuntime().availableProcessors();
        double cpuPercentage = 0.0;
        double sysLoad = 0.0;
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        if (osBean instanceof com.sun.management.OperatingSystemMXBean sunOsBean) {
            double load = sunOsBean.getCpuLoad();
            if (load >= 0) {
                cpuPercentage = Math.round(load * 1000.0) / 10.0;
            }
            double sLoad = sunOsBean.getSystemLoadAverage();
            if (sLoad >= 0) {
                sysLoad = Math.round(sLoad * 10.0) / 10.0;
            }
        }

        // 5. Filesystem Storage
        File root = new File(".");
        long totalSpace = root.getTotalSpace();
        long freeSpace = root.getFreeSpace();
        long usedSpace = totalSpace - freeSpace;

        double storageTotalGb = Math.round(((double) totalSpace / (1024.0 * 1024.0 * 1024.0)) * 10.0) / 10.0;
        double storageUsedGb = Math.round(((double) usedSpace / (1024.0 * 1024.0 * 1024.0)) * 10.0) / 10.0;
        double storageFreeGb = Math.round(((double) freeSpace / (1024.0 * 1024.0 * 1024.0)) * 10.0) / 10.0;
        double storagePercentage = totalSpace > 0 ? Math.round(((double) usedSpace / (double) totalSpace * 100.0) * 10.0) / 10.0 : 0.0;

        long reqEnd = System.currentTimeMillis();
        long responseTime = Math.max(1, reqEnd - reqStart);

        return SystemMonitoringResponse.builder()
                .backend(SystemMonitoringResponse.BackendMetrics.builder()
                        .status("Operational")
                        .framework(frameworkStr)
                        .javaVersion("Java " + javaVer)
                        .uptimeSeconds(uptimeMs / 1000)
                        .startedAt(startTime)
                        .build())
                .database(SystemMonitoringResponse.DatabaseMetrics.builder()
                        .status(dbStatus)
                        .databaseType("PostgreSQL")
                        .version(pgVersion)
                        .connectionStatus(dbConn)
                        .latencyMs(dbLatency)
                        .build())
                .api(SystemMonitoringResponse.ApiMetrics.builder()
                        .status("Healthy")
                        .apiType("REST API")
                        .responseTimeMs(responseTime)
                        .build())
                .memory(SystemMonitoringResponse.MemoryMetrics.builder()
                        .usedGb(usedGb)
                        .totalGb(totalGb)
                        .maxGb(maxGb)
                        .percentage(memPercentage)
                        .build())
                .cpu(SystemMonitoringResponse.CpuMetrics.builder()
                        .percentage(cpuPercentage)
                        .availableProcessors(processors)
                        .systemLoad(sysLoad)
                        .build())
                .storage(SystemMonitoringResponse.StorageMetrics.builder()
                        .usedGb(storageUsedGb)
                        .totalGb(storageTotalGb)
                        .freeGb(storageFreeGb)
                        .percentage(storagePercentage)
                        .build())
                .application(SystemMonitoringResponse.ApplicationMetrics.builder()
                        .version("0.0.1-SNAPSHOT")
                        .environment(activeProfile)
                        .build("Spring Boot " + (springVer != null ? springVer : "3.5.16") + " (JDK " + javaVer + ")")
                        .build())
                .build();
    }
}
