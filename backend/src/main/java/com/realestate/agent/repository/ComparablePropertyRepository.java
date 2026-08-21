package com.realestate.agent.repository;

import com.realestate.agent.entity.ComparableProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComparablePropertyRepository extends JpaRepository<ComparableProperty, Long> {
    List<ComparableProperty> findByPropertyPropertyId(Long propertyId);
    List<ComparableProperty> findByComparablePropertyPropertyId(Long comparablePropertyId);
    boolean existsByPropertyPropertyIdAndComparablePropertyPropertyId(Long propertyId, Long comparablePropertyId);
}
