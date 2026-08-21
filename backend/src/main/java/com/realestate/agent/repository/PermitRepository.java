package com.realestate.agent.repository;

import com.realestate.agent.entity.Permit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermitRepository extends JpaRepository<Permit, Long> {
    List<Permit> findByPropertyPropertyId(Long propertyId);
    Optional<Permit> findByPermitNumber(String permitNumber);
    boolean existsByPermitNumber(String permitNumber);
}
