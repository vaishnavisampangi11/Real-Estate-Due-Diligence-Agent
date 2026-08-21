package com.realestate.agent.service.impl;

import com.realestate.agent.dto.*;
import com.realestate.agent.entity.*;
import com.realestate.agent.exception.DuplicateResourceException;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.VerificationMapper;
import com.realestate.agent.repository.*;
import com.realestate.agent.service.VerificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VerificationServiceImpl implements VerificationService {

    private final PropertyRepository propertyRepository;
    private final PropertyTaxRepository propertyTaxRepository;
    private final PermitRepository permitRepository;
    private final ZoningInformationRepository zoningInformationRepository;
    private final FloodInformationRepository floodInformationRepository;
    private final EnvironmentalRecordRepository environmentalRecordRepository;
    private final UtilityInformationRepository utilityInformationRepository;
    private final VerificationMapper verificationMapper;

    public VerificationServiceImpl(
            PropertyRepository propertyRepository,
            PropertyTaxRepository propertyTaxRepository,
            PermitRepository permitRepository,
            ZoningInformationRepository zoningInformationRepository,
            FloodInformationRepository floodInformationRepository,
            EnvironmentalRecordRepository environmentalRecordRepository,
            UtilityInformationRepository utilityInformationRepository,
            VerificationMapper verificationMapper
    ) {
        this.propertyRepository = propertyRepository;
        this.propertyTaxRepository = propertyTaxRepository;
        this.permitRepository = permitRepository;
        this.zoningInformationRepository = zoningInformationRepository;
        this.floodInformationRepository = floodInformationRepository;
        this.environmentalRecordRepository = environmentalRecordRepository;
        this.utilityInformationRepository = utilityInformationRepository;
        this.verificationMapper = verificationMapper;
    }

    // PROPERTY TAX CRUD
    @Override
    @Transactional
    public PropertyTaxResponse createPropertyTax(PropertyTaxRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));
        PropertyTax tax = verificationMapper.toPropertyTaxEntity(request);
        tax.setProperty(property);
        return verificationMapper.toPropertyTaxResponse(propertyTaxRepository.save(tax));
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyTaxResponse getPropertyTaxById(Long id) {
        PropertyTax tax = propertyTaxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property tax record not found with ID: " + id));
        return verificationMapper.toPropertyTaxResponse(tax);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PropertyTaxResponse> getPropertyTaxesByProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
        }
        return propertyTaxRepository.findByPropertyPropertyId(propertyId).stream()
                .map(verificationMapper::toPropertyTaxResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PropertyTaxResponse updatePropertyTax(Long id, PropertyTaxRequest request) {
        PropertyTax tax = propertyTaxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property tax record not found with ID: " + id));
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));
        
        verificationMapper.updatePropertyTaxFromRequest(request, tax);
        tax.setProperty(property);
        return verificationMapper.toPropertyTaxResponse(propertyTaxRepository.save(tax));
    }

    @Override
    @Transactional
    public void deletePropertyTax(Long id) {
        PropertyTax tax = propertyTaxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property tax record not found with ID: " + id));
        propertyTaxRepository.delete(tax);
    }

    // PERMIT CRUD
    @Override
    @Transactional
    public PermitResponse createPermit(PermitRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));
        
        if (permitRepository.existsByPermitNumber(request.getPermitNumber())) {
            throw new DuplicateResourceException("Permit with number " + request.getPermitNumber() + " already exists.");
        }

        Permit permit = verificationMapper.toPermitEntity(request);
        permit.setProperty(property);
        return verificationMapper.toPermitResponse(permitRepository.save(permit));
    }

    @Override
    @Transactional(readOnly = true)
    public PermitResponse getPermitById(Long id) {
        Permit permit = permitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found with ID: " + id));
        return verificationMapper.toPermitResponse(permit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PermitResponse> getPermitsByProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
        }
        return permitRepository.findByPropertyPropertyId(propertyId).stream()
                .map(verificationMapper::toPermitResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PermitResponse updatePermit(Long id, PermitRequest request) {
        Permit permit = permitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found with ID: " + id));
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));

        if (!permit.getPermitNumber().equals(request.getPermitNumber()) &&
                permitRepository.existsByPermitNumber(request.getPermitNumber())) {
            throw new DuplicateResourceException("Permit with number " + request.getPermitNumber() + " already exists.");
        }

        verificationMapper.updatePermitFromRequest(request, permit);
        permit.setProperty(property);
        return verificationMapper.toPermitResponse(permitRepository.save(permit));
    }

    @Override
    @Transactional
    public void deletePermit(Long id) {
        Permit permit = permitRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permit not found with ID: " + id));
        permitRepository.delete(permit);
    }

    // ZONING CRUD
    @Override
    @Transactional
    public ZoningInformationResponse createZoning(ZoningInformationRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));
        ZoningInformation zoning = verificationMapper.toZoningInformationEntity(request);
        zoning.setProperty(property);
        return verificationMapper.toZoningInformationResponse(zoningInformationRepository.save(zoning));
    }

    @Override
    @Transactional(readOnly = true)
    public ZoningInformationResponse getZoningById(Long id) {
        ZoningInformation zoning = zoningInformationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zoning information record not found with ID: " + id));
        return verificationMapper.toZoningInformationResponse(zoning);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ZoningInformationResponse> getZoningByProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
        }
        return zoningInformationRepository.findByPropertyPropertyId(propertyId).stream()
                .map(verificationMapper::toZoningInformationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ZoningInformationResponse updateZoning(Long id, ZoningInformationRequest request) {
        ZoningInformation zoning = zoningInformationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zoning information record not found with ID: " + id));
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));

        verificationMapper.updateZoningFromRequest(request, zoning);
        zoning.setProperty(property);
        return verificationMapper.toZoningInformationResponse(zoningInformationRepository.save(zoning));
    }

    @Override
    @Transactional
    public void deleteZoning(Long id) {
        ZoningInformation zoning = zoningInformationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zoning information record not found with ID: " + id));
        zoningInformationRepository.delete(zoning);
    }

    // FLOOD INFO CRUD
    @Override
    @Transactional
    public FloodInformationResponse createFloodInfo(FloodInformationRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));
        FloodInformation flood = verificationMapper.toFloodInformationEntity(request);
        flood.setProperty(property);
        return verificationMapper.toFloodInformationResponse(floodInformationRepository.save(flood));
    }

    @Override
    @Transactional(readOnly = true)
    public FloodInformationResponse getFloodInfoById(Long id) {
        FloodInformation flood = floodInformationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flood information record not found with ID: " + id));
        return verificationMapper.toFloodInformationResponse(flood);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FloodInformationResponse> getFloodInfoByProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
        }
        return floodInformationRepository.findByPropertyPropertyId(propertyId).stream()
                .map(verificationMapper::toFloodInformationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FloodInformationResponse updateFloodInfo(Long id, FloodInformationRequest request) {
        FloodInformation flood = floodInformationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flood information record not found with ID: " + id));
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));

        verificationMapper.updateFloodFromRequest(request, flood);
        flood.setProperty(property);
        return verificationMapper.toFloodInformationResponse(floodInformationRepository.save(flood));
    }

    @Override
    @Transactional
    public void deleteFloodInfo(Long id) {
        FloodInformation flood = floodInformationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flood information record not found with ID: " + id));
        floodInformationRepository.delete(flood);
    }

    // ENVIRONMENTAL RECORD CRUD
    @Override
    @Transactional
    public EnvironmentalRecordResponse createEnvironmentalRecord(EnvironmentalRecordRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));
        EnvironmentalRecord env = verificationMapper.toEnvironmentalRecordEntity(request);
        env.setProperty(property);
        return verificationMapper.toEnvironmentalRecordResponse(environmentalRecordRepository.save(env));
    }

    @Override
    @Transactional(readOnly = true)
    public EnvironmentalRecordResponse getEnvironmentalRecordById(Long id) {
        EnvironmentalRecord env = environmentalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Environmental record not found with ID: " + id));
        return verificationMapper.toEnvironmentalRecordResponse(env);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnvironmentalRecordResponse> getEnvironmentalRecordsByProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
        }
        return environmentalRecordRepository.findByPropertyPropertyId(propertyId).stream()
                .map(verificationMapper::toEnvironmentalRecordResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EnvironmentalRecordResponse updateEnvironmentalRecord(Long id, EnvironmentalRecordRequest request) {
        EnvironmentalRecord env = environmentalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Environmental record not found with ID: " + id));
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));

        verificationMapper.updateEnvironmentalFromRequest(request, env);
        env.setProperty(property);
        return verificationMapper.toEnvironmentalRecordResponse(environmentalRecordRepository.save(env));
    }

    @Override
    @Transactional
    public void deleteEnvironmentalRecord(Long id) {
        EnvironmentalRecord env = environmentalRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Environmental record not found with ID: " + id));
        environmentalRecordRepository.delete(env);
    }

    // UTILITY INFORMATION CRUD
    @Override
    @Transactional
    public UtilityInformationResponse createUtilityInfo(UtilityInformationRequest request) {
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));
        UtilityInformation util = verificationMapper.toUtilityInformationEntity(request);
        util.setProperty(property);
        return verificationMapper.toUtilityInformationResponse(utilityInformationRepository.save(util));
    }

    @Override
    @Transactional(readOnly = true)
    public UtilityInformationResponse getUtilityInfoById(Long id) {
        UtilityInformation util = utilityInformationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utility information record not found with ID: " + id));
        return verificationMapper.toUtilityInformationResponse(util);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UtilityInformationResponse> getUtilityInfoByProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
        }
        return utilityInformationRepository.findByPropertyPropertyId(propertyId).stream()
                .map(verificationMapper::toUtilityInformationResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UtilityInformationResponse updateUtilityInfo(Long id, UtilityInformationRequest request) {
        UtilityInformation util = utilityInformationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utility information record not found with ID: " + id));
        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found with ID: " + request.getPropertyId()));

        verificationMapper.updateUtilityFromRequest(request, util);
        util.setProperty(property);
        return verificationMapper.toUtilityInformationResponse(utilityInformationRepository.save(util));
    }

    @Override
    @Transactional
    public void deleteUtilityInfo(Long id) {
        UtilityInformation util = utilityInformationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utility information record not found with ID: " + id));
        utilityInformationRepository.delete(util);
    }
}
