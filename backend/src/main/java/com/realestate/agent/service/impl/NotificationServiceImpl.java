package com.realestate.agent.service.impl;

import com.realestate.agent.dto.NotificationRequest;
import com.realestate.agent.dto.NotificationResponse;
import com.realestate.agent.entity.DueDiligenceReport;
import com.realestate.agent.entity.Notification;
import com.realestate.agent.entity.Property;
import com.realestate.agent.entity.User;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.NotificationMapper;
import com.realestate.agent.repository.DueDiligenceReportRepository;
import com.realestate.agent.repository.NotificationRepository;
import com.realestate.agent.repository.PropertyRepository;
import com.realestate.agent.repository.UserRepository;
import com.realestate.agent.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final DueDiligenceReportRepository reportRepository;
    private final NotificationMapper notificationMapper;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            PropertyRepository propertyRepository,
            DueDiligenceReportRepository reportRepository,
            NotificationMapper notificationMapper
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.reportRepository = reportRepository;
        this.notificationMapper = notificationMapper;
    }

    @Override
    @Transactional
    public NotificationResponse sendNotification(NotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getUserId()));

        Property property = null;
        if (request.getPropertyId() != null) {
            property = propertyRepository.findById(request.getPropertyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));
        }

        DueDiligenceReport report = null;
        if (request.getReportId() != null) {
            report = reportRepository.findById(request.getReportId())
                    .orElseThrow(() -> new ResourceNotFoundException("Report not found with ID: " + request.getReportId()));
        }

        Notification notification = Notification.builder()
                .user(user)
                .property(property)
                .report(report)
                .notificationType(request.getNotificationType())
                .title(request.getTitle())
                .message(request.getMessage())
                .isRead(false)
                .build();

        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationResponse getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        return notificationMapper.toResponse(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return notificationRepository.findByUserUserIdOrderBySentAtDesc(user.getUserId()).stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotificationsForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return notificationRepository.findByUserUserIdAndIsReadFalseOrderBySentAtDesc(user.getUserId()).stream()
                .map(notificationMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCountForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return notificationRepository.countByUserUserIdAndIsReadFalse(user.getUserId());
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        notification.setIsRead(true);
        return notificationMapper.toResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        List<Notification> unread = notificationRepository.findByUserUserIdAndIsReadFalseOrderBySentAtDesc(user.getUserId());
        unread.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with ID: " + id));
        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void clearReadNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        List<Notification> all = notificationRepository.findByUserUserIdOrderBySentAtDesc(user.getUserId());
        List<Notification> read = all.stream().filter(n -> Boolean.TRUE.equals(n.getIsRead())).collect(Collectors.toList());
        notificationRepository.deleteAll(read);
    }
}
