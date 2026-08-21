package com.realestate.agent.repository;

import com.realestate.agent.entity.UtilityInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UtilityInformationRepository extends JpaRepository<UtilityInformation, Long> {
    List<UtilityInformation> findByPropertyPropertyId(Long propertyId);
}
