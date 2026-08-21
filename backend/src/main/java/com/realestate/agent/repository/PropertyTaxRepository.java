package com.realestate.agent.repository;

import com.realestate.agent.entity.PropertyTax;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyTaxRepository extends JpaRepository<PropertyTax, Long> {
    List<PropertyTax> findByPropertyPropertyId(Long propertyId);
}
