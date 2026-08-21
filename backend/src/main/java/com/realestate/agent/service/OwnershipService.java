package com.realestate.agent.service;

import com.realestate.agent.dto.OwnerRequest;
import com.realestate.agent.dto.OwnerResponse;
import com.realestate.agent.dto.OwnershipRecordRequest;
import com.realestate.agent.dto.OwnershipRecordResponse;

import java.util.List;

public interface OwnershipService {
    
    // Owner endpoints
    OwnerResponse createOwner(OwnerRequest request);
    OwnerResponse getOwnerById(Long id);
    OwnerResponse updateOwner(Long id, OwnerRequest request);
    void deleteOwner(Long id);
    List<OwnerResponse> getAllOwners();

    // Ownership split endpoints
    OwnershipRecordResponse addOwnershipRecord(OwnershipRecordRequest request);
    List<OwnershipRecordResponse> getOwnershipRecordsByProperty(Long propertyId);
    OwnershipRecordResponse getOwnershipRecordById(Long id);
    OwnershipRecordResponse updateOwnershipRecord(Long id, OwnershipRecordRequest request);
    void deleteOwnershipRecord(Long id);
}
