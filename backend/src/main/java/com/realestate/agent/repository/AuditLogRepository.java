package com.realestate.agent.repository;

import com.realestate.agent.entity.AuditLog;
import com.realestate.agent.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByUser(User user);

    List<AuditLog> findAllByOrderByCreatedAtDesc();

    List<AuditLog> findByEntityNameAndEntityId(
            String entityName,
            Long entityId
    );
}