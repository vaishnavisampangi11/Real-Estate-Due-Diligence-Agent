package com.realestate.agent.repository;

import com.realestate.agent.entity.ApiLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApiLogRepository extends JpaRepository<ApiLog, Long> {
    List<ApiLog> findByApiProviderApiProviderIdOrderByRequestTimeDesc(Long apiProviderId);
    List<ApiLog> findByPropertyPropertyIdOrderByRequestTimeDesc(Long propertyId);
    List<ApiLog> findBySuccessFalseOrderByRequestTimeDesc();
}
