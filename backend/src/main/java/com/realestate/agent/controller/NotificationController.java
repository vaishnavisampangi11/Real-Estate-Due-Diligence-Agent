package com.realestate.agent.controller;

import com.realestate.agent.dto.NotificationRequest;
import com.realestate.agent.dto.NotificationResponse;
import com.realestate.agent.security.CustomUserDetails;
import com.realestate.agent.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Notification Controller", description = "CRUD APIs for Managing Notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRATOR', 'REAL_ESTATE_AGENT')")
    @Operation(summary = "Send notification", description = "Generates and sends a notification to a specific user. Only Administrators and Real Estate Agents can perform this action.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Notification sent successfully",
                    content = @Content(schema = @Schema(implementation = NotificationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request payload"),
            @ApiResponse(responseCode = "404", description = "User, Property or Report not found")
    })
    public ResponseEntity<NotificationResponse> sendNotification(@Valid @RequestBody NotificationRequest request) {
        NotificationResponse response = notificationService.sendNotification(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get user notifications", description = "Retrieves all notifications for the currently logged-in user.")
    @ApiResponse(responseCode = "200", description = "Notifications list retrieved")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<NotificationResponse> response = notificationService.getNotificationsForUser(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread")
    @Operation(summary = "Get user unread notifications", description = "Retrieves all unread notifications for the currently logged-in user.")
    @ApiResponse(responseCode = "200", description = "Unread notifications list retrieved")
    public ResponseEntity<List<NotificationResponse>> getMyUnreadNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<NotificationResponse> response = notificationService.getUnreadNotificationsForUser(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get user unread notifications count", description = "Retrieves the count of unread notifications for the currently logged-in user.")
    @ApiResponse(responseCode = "200", description = "Count retrieved successfully")
    public ResponseEntity<Long> getMyUnreadCount(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        long count = notificationService.getUnreadCountForUser(userDetails.getUsername());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Updates a notification's read status to true.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Notification marked as read successfully",
                    content = @Content(schema = @Schema(implementation = NotificationResponse.class))),
            @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable("id") Long id) {
        NotificationResponse response = notificationService.markAsRead(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all notifications as read", description = "Marks all unread notifications of the currently logged-in user as read.")
    @ApiResponse(responseCode = "204", description = "All notifications marked as read successfully")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/read")
    @Operation(summary = "Clear all read notifications", description = "Deletes all read notifications of the currently logged-in user.")
    @ApiResponse(responseCode = "204", description = "All read notifications deleted successfully")
    public ResponseEntity<Void> clearReadNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.clearReadNotifications(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete notification", description = "Deletes a notification by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Notification deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<Void> deleteNotification(@PathVariable("id") Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
