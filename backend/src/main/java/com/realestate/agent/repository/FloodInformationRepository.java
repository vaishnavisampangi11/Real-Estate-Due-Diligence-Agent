package com.realestate.agent.repository;

import com.realestate.agent.entity.FloodInformation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloodInformationRepository extends JpaRepository<FloodInformation, Long> {
    List<FloodInformation> findByPropertyPropertyId(Long propertyId);
}
