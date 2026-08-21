package com.realestate.agent.repository;

import com.realestate.agent.entity.EnvironmentalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnvironmentalRecordRepository extends JpaRepository<EnvironmentalRecord, Long> {
    List<EnvironmentalRecord> findByPropertyPropertyId(Long propertyId);
}
