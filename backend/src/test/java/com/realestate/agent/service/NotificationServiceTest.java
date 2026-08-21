package com.realestate.agent.service;

import com.realestate.agent.dto.NotificationRequest;
import com.realestate.agent.dto.NotificationResponse;
import com.realestate.agent.entity.Notification;
import com.realestate.agent.entity.User;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.NotificationMapper;
import com.realestate.agent.repository.DueDiligenceReportRepository;
import com.realestate.agent.repository.NotificationRepository;
import com.realestate.agent.repository.PropertyRepository;
import com.realestate.agent.repository.UserRepository;
import com.realestate.agent.service.impl.NotificationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private DueDiligenceReportRepository reportRepository;

    @Mock
    private NotificationMapper notificationMapper;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    private User mockUser;
    private Notification mockNotification;
    private NotificationResponse mockResponse;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .userId(1L)
                .email("user@example.com")
                .firstName("Rama")
                .build();

        mockNotification = Notification.builder()
                .notificationId(50L)
                .user(mockUser)
                .title("Report Ready")
                .message("Due diligence report generated successfully.")
                .isRead(false)
                .build();

        mockResponse = NotificationResponse.builder()
                .notificationId(50L)
                .title("Report Ready")
                .message("Due diligence report generated successfully.")
                .isRead(false)
                .build();
    }

    @Test
    @DisplayName("Should successfully retrieve notifications for user")
    void getNotificationsForUser_Success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(notificationRepository.findByUserUserIdOrderBySentAtDesc(1L)).thenReturn(List.of(mockNotification));
        when(notificationMapper.toResponse(mockNotification)).thenReturn(mockResponse);

        List<NotificationResponse> list = notificationService.getNotificationsForUser("user@example.com");

        assertNotNull(list);
        assertEquals(1, list.size());
        assertEquals("Report Ready", list.get(0).getTitle());
    }

    @Test
    @DisplayName("Should return correct unread count for user")
    void getUnreadCountForUser_Success() {
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(notificationRepository.countByUserUserIdAndIsReadFalse(1L)).thenReturn(3L);

        long count = notificationService.getUnreadCountForUser("user@example.com");

        assertEquals(3L, count);
    }

    @Test
    @DisplayName("Should mark a notification as read successfully")
    void markAsRead_Success() {
        Notification readNotif = Notification.builder()
                .notificationId(50L)
                .isRead(true)
                .build();

        NotificationResponse readResponse = NotificationResponse.builder()
                .notificationId(50L)
                .isRead(true)
                .build();

        when(notificationRepository.findById(50L)).thenReturn(Optional.of(mockNotification));
        when(notificationRepository.save(any(Notification.class))).thenReturn(readNotif);
        when(notificationMapper.toResponse(readNotif)).thenReturn(readResponse);

        NotificationResponse response = notificationService.markAsRead(50L);

        assertNotNull(response);
        assertTrue(response.getIsRead());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when notification ID does not exist")
    void markAsRead_NotFound_ThrowsException() {
        when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> notificationService.markAsRead(999L));
    }
}
