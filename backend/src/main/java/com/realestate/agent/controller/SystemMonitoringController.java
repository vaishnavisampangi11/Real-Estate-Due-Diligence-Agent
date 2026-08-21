package com.realestate.agent.controller;

import com.realestate.agent.dto.SystemMonitoringResponse;
import com.realestate.agent.service.SystemMonitoringService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/system-monitoring")
@SecurityRequirement(name = "bearerAuth")
@Tag(
        name = "System Monitoring Controller",
        description = "Live infrastructure, JVM, PostgreSQL, and runtime telemetry endpoints"
)
public class SystemMonitoringController {

    private final SystemMonitoringService systemMonitoringService;

    public SystemMonitoringController(SystemMonitoringService systemMonitoringService) {
        this.systemMonitoringService = systemMonitoringService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(
            summary = "Get live system monitoring telemetry",
            description = "Retrieves live runtime metrics including JVM memory, CPU, storage, PostgreSQL cluster connectivity, and server uptime."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "System monitoring telemetry retrieved successfully",
                    content = @Content(
                            schema = @Schema(
                                    implementation = SystemMonitoringResponse.class
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Access denied. Administrator role required."
            )
    })
    public ResponseEntity<SystemMonitoringResponse> getSystemTelemetry() {
        SystemMonitoringResponse response = systemMonitoringService.getSystemTelemetry();
        return ResponseEntity.ok(response);
    }
}
