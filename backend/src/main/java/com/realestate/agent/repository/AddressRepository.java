package com.realestate.agent.repository;

import com.realestate.agent.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByPropertyPropertyId(Long propertyId);

    List<Address> findByPropertyPropertyIdIn(List<Long> propertyIds);
}
