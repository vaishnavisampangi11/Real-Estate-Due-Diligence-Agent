package com.realestate.agent.repository;

import com.realestate.agent.entity.PropertyListing;
import com.realestate.agent.enums.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyListingRepository extends JpaRepository<PropertyListing, Long> {

    List<PropertyListing> findByPropertyPropertyId(Long propertyId);

    List<PropertyListing> findByPropertyPropertyIdIn(List<Long> propertyIds);

    List<PropertyListing> findByListingStatus(ListingStatus listingStatus);
}
