package com.realestate.agent.repository;

import com.realestate.agent.entity.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long>, JpaSpecificationExecutor<Property> {

    Optional<Property> findByPropertyCode(String propertyCode);

    boolean existsByPropertyCode(String propertyCode);

    Page<Property> findByCreatedBy_UserId(Long userId, Pageable pageable);
}
