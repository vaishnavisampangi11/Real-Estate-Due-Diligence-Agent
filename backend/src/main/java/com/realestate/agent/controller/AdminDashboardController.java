package com.realestate.agent.controller;

import com.realestate.agent.dto.AdminDashboardResponse;
import com.realestate.agent.service.AdminDashboardService;
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
@RequestMapping("/api/admin/dashboard")
@SecurityRequirement(name = "bearerAuth")
@Tag(
        name = "Admin Dashboard Controller",
        description = "Administrative dashboard analytics and platform statistics"
)
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMINISTRATOR')")
    @Operation(
            summary = "Get administrative dashboard analytics",
            description = "Returns platform-wide statistics for the administrator dashboard."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Dashboard analytics retrieved successfully",
                    content = @Content(
                            schema = @Schema(
                                    implementation = AdminDashboardResponse.class
                            )
                    )
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Access denied. Administrator role required."
            )
    })
    public ResponseEntity<AdminDashboardResponse> getDashboardAnalytics() {

        AdminDashboardResponse response =
                adminDashboardService.getDashboardAnalytics();

        return ResponseEntity.ok(response);
    }
}