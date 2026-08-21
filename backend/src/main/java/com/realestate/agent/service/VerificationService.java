package com.realestate.agent.service;

import com.realestate.agent.dto.*;
import java.util.List;

public interface VerificationService {

    // Property Tax CRUD
    PropertyTaxResponse createPropertyTax(PropertyTaxRequest request);
    PropertyTaxResponse getPropertyTaxById(Long id);
    List<PropertyTaxResponse> getPropertyTaxesByProperty(Long propertyId);
    PropertyTaxResponse updatePropertyTax(Long id, PropertyTaxRequest request);
    void deletePropertyTax(Long id);

    // Permit CRUD
    PermitResponse createPermit(PermitRequest request);
    PermitResponse getPermitById(Long id);
    List<PermitResponse> getPermitsByProperty(Long propertyId);
    PermitResponse updatePermit(Long id, PermitRequest request);
    void deletePermit(Long id);

    // Zoning Information CRUD
    ZoningInformationResponse createZoning(ZoningInformationRequest request);
    ZoningInformationResponse getZoningById(Long id);
    List<ZoningInformationResponse> getZoningByProperty(Long propertyId);
    ZoningInformationResponse updateZoning(Long id, ZoningInformationRequest request);
    void deleteZoning(Long id);

    // Flood Information CRUD
    FloodInformationResponse createFloodInfo(FloodInformationRequest request);
    FloodInformationResponse getFloodInfoById(Long id);
    List<FloodInformationResponse> getFloodInfoByProperty(Long propertyId);
    FloodInformationResponse updateFloodInfo(Long id, FloodInformationRequest request);
    void deleteFloodInfo(Long id);

    // Environmental Record CRUD
    EnvironmentalRecordResponse createEnvironmentalRecord(EnvironmentalRecordRequest request);
    EnvironmentalRecordResponse getEnvironmentalRecordById(Long id);
    List<EnvironmentalRecordResponse> getEnvironmentalRecordsByProperty(Long propertyId);
    EnvironmentalRecordResponse updateEnvironmentalRecord(Long id, EnvironmentalRecordRequest request);
    void deleteEnvironmentalRecord(Long id);

    // Utility Information CRUD
    UtilityInformationResponse createUtilityInfo(UtilityInformationRequest request);
    UtilityInformationResponse getUtilityInfoById(Long id);
    List<UtilityInformationResponse> getUtilityInfoByProperty(Long propertyId);
    UtilityInformationResponse updateUtilityInfo(Long id, UtilityInformationRequest request);
    void deleteUtilityInfo(Long id);
}
