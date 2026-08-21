package com.realestate.agent.repository;

import com.realestate.agent.entity.OwnershipRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OwnershipRecordRepository extends JpaRepository<OwnershipRecord, Long> {
    List<OwnershipRecord> findByPropertyPropertyId(Long propertyId);
    List<OwnershipRecord> findByOwnerOwnerId(Long ownerId);
    List<OwnershipRecord> findByPropertyPropertyIdAndIsCurrentOwnerTrue(Long propertyId);
}
