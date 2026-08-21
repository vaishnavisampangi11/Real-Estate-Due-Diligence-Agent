package com.realestate.agent.repository;

import com.realestate.agent.entity.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PropertyTypeRepository extends JpaRepository<PropertyType, Long> {

    Optional<PropertyType> findByTypeName(String typeName);
}
