package com.realestate.agent.service;

import com.realestate.agent.dto.SystemMonitoringResponse;

public interface SystemMonitoringService {
    SystemMonitoringResponse getSystemTelemetry();
}
