package com.realestate.agent.service.impl;

import com.realestate.agent.dto.OwnerRequest;
import com.realestate.agent.dto.OwnerResponse;
import com.realestate.agent.dto.OwnershipRecordRequest;
import com.realestate.agent.dto.OwnershipRecordResponse;
import com.realestate.agent.entity.Owner;
import com.realestate.agent.entity.OwnershipRecord;
import com.realestate.agent.entity.Property;
import com.realestate.agent.exception.BadRequestException;
import com.realestate.agent.exception.DuplicateResourceException;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.OwnerMapper;
import com.realestate.agent.repository.OwnerRepository;
import com.realestate.agent.repository.OwnershipRecordRepository;
import com.realestate.agent.repository.PropertyRepository;
import com.realestate.agent.service.OwnershipService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OwnershipServiceImpl implements OwnershipService {

    private final OwnerRepository ownerRepository;
    private final OwnershipRecordRepository ownershipRecordRepository;
    private final PropertyRepository propertyRepository;
    private final OwnerMapper ownerMapper;

    public OwnershipServiceImpl(
            OwnerRepository ownerRepository,
            OwnershipRecordRepository ownershipRecordRepository,
            PropertyRepository propertyRepository,
            OwnerMapper ownerMapper
    ) {
        this.ownerRepository = ownerRepository;
        this.ownershipRecordRepository = ownershipRecordRepository;
        this.propertyRepository = propertyRepository;
        this.ownerMapper = ownerMapper;
    }

    @Override
    @Transactional
    public OwnerResponse createOwner(OwnerRequest request) {
        if (ownerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Owner with email " + request.getEmail() + " already exists.");
        }
        Owner owner = ownerMapper.toOwnerEntity(request);
        Owner savedOwner = ownerRepository.save(owner);
        return ownerMapper.toOwnerResponse(savedOwner);
    }

    @Override
    @Transactional(readOnly = true)
    public OwnerResponse getOwnerById(Long id) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + id));
        return ownerMapper.toOwnerResponse(owner);
    }

    @Override
    @Transactional
    public OwnerResponse updateOwner(Long id, OwnerRequest request) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + id));

        if (request.getEmail() != null && !request.getEmail().equals(owner.getEmail()) &&
                ownerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Owner with email " + request.getEmail() + " already exists.");
        }

        ownerMapper.updateOwnerFromRequest(request, owner);
        Owner savedOwner = ownerRepository.save(owner);
        return ownerMapper.toOwnerResponse(savedOwner);
    }

    @Override
    @Transactional
    public void deleteOwner(Long id) {
        Owner owner = ownerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + id));
        
        List<OwnershipRecord> ownershipRecords = ownershipRecordRepository.findByOwnerOwnerId(id);
        if (!ownershipRecords.isEmpty()) {
            throw new BadRequestException("Cannot delete owner as they are linked to existing property ownership records.");
        }

        ownerRepository.delete(owner);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OwnerResponse> getAllOwners() {
        return ownerRepository.findAll().stream()
                .map(ownerMapper::toOwnerResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OwnershipRecordResponse addOwnershipRecord(OwnershipRecordRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));

        Owner owner = ownerRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + request.getOwnerId()));

        // Check if there is already an ownership record for this property and owner
        List<OwnershipRecord> existingForOwner = ownershipRecordRepository.findByPropertyPropertyId(request.getPropertyId());
        boolean alreadyExists = existingForOwner.stream()
                .anyMatch(r -> r.getOwner().getOwnerId().equals(request.getOwnerId()) && r.getIsCurrentOwner());
        if (alreadyExists) {
            throw new DuplicateResourceException("An active ownership record for this property and owner already exists.");
        }

        // Validate percentage limits
        BigDecimal currentSum = existingForOwner.stream()
                .filter(OwnershipRecord::getIsCurrentOwner)
                .map(OwnershipRecord::getOwnershipPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (currentSum.add(request.getOwnershipPercentage()).compareTo(new BigDecimal("100.00")) > 0) {
            throw new BadRequestException("Total active ownership percentage for this property cannot exceed 100%. Current sum: " + currentSum + "%");
        }

        OwnershipRecord record = OwnershipRecord.builder()
                .property(property)
                .owner(owner)
                .ownershipPercentage(request.getOwnershipPercentage())
                .purchaseDate(request.getPurchaseDate())
                .saleDate(request.getSaleDate())
                .isCurrentOwner(request.getIsCurrentOwner())
                .verificationStatus(request.getVerificationStatus())
                .build();

        OwnershipRecord savedRecord = ownershipRecordRepository.save(record);
        return ownerMapper.toOwnershipRecordResponse(savedRecord);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OwnershipRecordResponse> getOwnershipRecordsByProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
        }
        return ownershipRecordRepository.findByPropertyPropertyId(propertyId).stream()
                .map(ownerMapper::toOwnershipRecordResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OwnershipRecordResponse getOwnershipRecordById(Long id) {
        OwnershipRecord record = ownershipRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ownership record not found with ID: " + id));
        return ownerMapper.toOwnershipRecordResponse(record);
    }

    @Override
    @Transactional
    public OwnershipRecordResponse updateOwnershipRecord(Long id, OwnershipRecordRequest request) {
        OwnershipRecord record = ownershipRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ownership record not found with ID: " + id));

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));

        Owner owner = ownerRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("Owner not found with ID: " + request.getOwnerId()));

        // Validate percentage limits (excluding the current record being updated)
        List<OwnershipRecord> existing = ownershipRecordRepository.findByPropertyPropertyId(request.getPropertyId());
        BigDecimal currentSum = existing.stream()
                .filter(r -> r.getIsCurrentOwner() && !r.getOwnershipId().equals(id))
                .map(OwnershipRecord::getOwnershipPercentage)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (request.getIsCurrentOwner() && currentSum.add(request.getOwnershipPercentage()).compareTo(new BigDecimal("100.00")) > 0) {
            throw new BadRequestException("Total active ownership percentage for this property cannot exceed 100%. Current other sum: " + currentSum + "%");
        }

        record.setProperty(property);
        record.setOwner(owner);
        record.setOwnershipPercentage(request.getOwnershipPercentage());
        record.setPurchaseDate(request.getPurchaseDate());
        record.setSaleDate(request.getSaleDate());
        record.setIsCurrentOwner(request.getIsCurrentOwner());
        record.setVerificationStatus(request.getVerificationStatus());

        OwnershipRecord savedRecord = ownershipRecordRepository.save(record);
        return ownerMapper.toOwnershipRecordResponse(savedRecord);
    }

    @Override
    @Transactional
    public void deleteOwnershipRecord(Long id) {
        OwnershipRecord record = ownershipRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ownership record not found with ID: " + id));
        ownershipRecordRepository.delete(record);
    }
}
