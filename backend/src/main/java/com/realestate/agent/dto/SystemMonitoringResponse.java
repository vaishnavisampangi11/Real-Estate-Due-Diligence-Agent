package com.realestate.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemMonitoringResponse {
    private BackendMetrics backend;
    private DatabaseMetrics database;
    private ApiMetrics api;
    private MemoryMetrics memory;
    private CpuMetrics cpu;
    private StorageMetrics storage;
    private ApplicationMetrics application;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BackendMetrics {
        private String status;
        private String framework;
        private String javaVersion;
        private Long uptimeSeconds;
        private Long startedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DatabaseMetrics {
        private String status;
        private String databaseType;
        private String version;
        private String connectionStatus;
        private Long latencyMs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiMetrics {
        private String status;
        private String apiType;
        private Long responseTimeMs;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemoryMetrics {
        private Double usedGb;
        private Double totalGb;
        private Double maxGb;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CpuMetrics {
        private Double percentage;
        private Integer availableProcessors;
        private Double systemLoad;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StorageMetrics {
        private Double usedGb;
        private Double totalGb;
        private Double freeGb;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationMetrics {
        private String version;
        private String environment;
        private String build;
    }
}
