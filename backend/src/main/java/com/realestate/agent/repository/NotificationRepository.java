package com.realestate.agent.repository;

import com.realestate.agent.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserUserIdOrderBySentAtDesc(Long userId);
    List<Notification> findByUserUserIdAndIsReadFalseOrderBySentAtDesc(Long userId);
    long countByUserUserIdAndIsReadFalse(Long userId);
}
