package com.realestate.agent.mapper;

import com.realestate.agent.dto.*;
import com.realestate.agent.entity.*;
import org.springframework.stereotype.Component;

@Component
public class VerificationMapper {

    // Property Tax Mappings
    public PropertyTaxResponse toPropertyTaxResponse(PropertyTax tax) {
        if (tax == null) {
            return null;
        }
        return PropertyTaxResponse.builder()
                .taxId(tax.getTaxId())
                .propertyId(tax.getProperty() != null ? tax.getProperty().getPropertyId() : null)
                .propertyName(tax.getProperty() != null ? tax.getProperty().getPropertyName() : null)
                .taxYear(tax.getTaxYear())
                .assessedValue(tax.getAssessedValue())
                .taxAmount(tax.getTaxAmount())
                .dueAmount(tax.getDueAmount())
                .paidAmount(tax.getPaidAmount())
                .paymentStatus(tax.getPaymentStatus())
                .paymentDate(tax.getPaymentDate())
                .taxReceiptNumber(tax.getTaxReceiptNumber())
                .taxAuthority(tax.getTaxAuthority())
                .createdAt(tax.getCreatedAt())
                .updatedAt(tax.getUpdatedAt())
                .build();
    }

    public PropertyTax toPropertyTaxEntity(PropertyTaxRequest request) {
        if (request == null) {
            return null;
        }
        return PropertyTax.builder()
                .taxYear(request.getTaxYear())
                .assessedValue(request.getAssessedValue())
                .taxAmount(request.getTaxAmount())
                .dueAmount(request.getDueAmount())
                .paidAmount(request.getPaidAmount())
                .paymentStatus(request.getPaymentStatus())
                .paymentDate(request.getPaymentDate())
                .taxReceiptNumber(request.getTaxReceiptNumber())
                .taxAuthority(request.getTaxAuthority())
                .build();
    }

    public void updatePropertyTaxFromRequest(PropertyTaxRequest request, PropertyTax tax) {
        if (request == null || tax == null) {
            return;
        }
        tax.setTaxYear(request.getTaxYear());
        tax.setAssessedValue(request.getAssessedValue());
        tax.setTaxAmount(request.getTaxAmount());
        tax.setDueAmount(request.getDueAmount());
        tax.setPaidAmount(request.getPaidAmount());
        tax.setPaymentStatus(request.getPaymentStatus());
        tax.setPaymentDate(request.getPaymentDate());
        tax.setTaxReceiptNumber(request.getTaxReceiptNumber());
        tax.setTaxAuthority(request.getTaxAuthority());
    }

    // Permit Mappings
    public PermitResponse toPermitResponse(Permit permit) {
        if (permit == null) {
            return null;
        }
        return PermitResponse.builder()
                .permitId(permit.getPermitId())
                .propertyId(permit.getProperty() != null ? permit.getProperty().getPropertyId() : null)
                .propertyName(permit.getProperty() != null ? permit.getProperty().getPropertyName() : null)
                .permitNumber(permit.getPermitNumber())
                .permitType(permit.getPermitType())
                .issuingAuthority(permit.getIssuingAuthority())
                .issueDate(permit.getIssueDate())
                .expiryDate(permit.getExpiryDate())
                .status(permit.getStatus())
                .documentUrl(permit.getDocumentUrl())
                .verificationStatus(permit.getVerificationStatus())
                .createdAt(permit.getCreatedAt())
                .updatedAt(permit.getUpdatedAt())
                .build();
    }

    public Permit toPermitEntity(PermitRequest request) {
        if (request == null) {
            return null;
        }
        return Permit.builder()
                .permitNumber(request.getPermitNumber())
                .permitType(request.getPermitType())
                .issuingAuthority(request.getIssuingAuthority())
                .issueDate(request.getIssueDate())
                .expiryDate(request.getExpiryDate())
                .status(request.getStatus())
                .documentUrl(request.getDocumentUrl())
                .verificationStatus(request.getVerificationStatus())
                .build();
    }

    public void updatePermitFromRequest(PermitRequest request, Permit permit) {
        if (request == null || permit == null) {
            return;
        }
        permit.setPermitNumber(request.getPermitNumber());
        permit.setPermitType(request.getPermitType());
        permit.setIssuingAuthority(request.getIssuingAuthority());
        permit.setIssueDate(request.getIssueDate());
        permit.setExpiryDate(request.getExpiryDate());
        permit.setStatus(request.getStatus());
        permit.setDocumentUrl(request.getDocumentUrl());
        permit.setVerificationStatus(request.getVerificationStatus());
    }

    // Zoning Mappings
    public ZoningInformationResponse toZoningInformationResponse(ZoningInformation zoning) {
        if (zoning == null) {
            return null;
        }
        return ZoningInformationResponse.builder()
                .zoningId(zoning.getZoningId())
                .propertyId(zoning.getProperty() != null ? zoning.getProperty().getPropertyId() : null)
                .propertyName(zoning.getProperty() != null ? zoning.getProperty().getPropertyName() : null)
                .zoneCode(zoning.getZoneCode())
                .zoneName(zoning.getZoneName())
                .landUse(zoning.getLandUse())
                .maxBuildingHeight(zoning.getMaxBuildingHeight())
                .floorAreaRatio(zoning.getFloorAreaRatio())
                .complianceStatus(zoning.getComplianceStatus())
                .remarks(zoning.getRemarks())
                .createdAt(zoning.getCreatedAt())
                .updatedAt(zoning.getUpdatedAt())
                .build();
    }

    public ZoningInformation toZoningInformationEntity(ZoningInformationRequest request) {
        if (request == null) {
            return null;
        }
        return ZoningInformation.builder()
                .zoneCode(request.getZoneCode())
                .zoneName(request.getZoneName())
                .landUse(request.getLandUse())
                .maxBuildingHeight(request.getMaxBuildingHeight())
                .floorAreaRatio(request.getFloorAreaRatio())
                .complianceStatus(request.getComplianceStatus())
                .remarks(request.getRemarks())
                .build();
    }

    public void updateZoningFromRequest(ZoningInformationRequest request, ZoningInformation zoning) {
        if (request == null || zoning == null) {
            return;
        }
        zoning.setZoneCode(request.getZoneCode());
        zoning.setZoneName(request.getZoneName());
        zoning.setLandUse(request.getLandUse());
        zoning.setMaxBuildingHeight(request.getMaxBuildingHeight());
        zoning.setFloorAreaRatio(request.getFloorAreaRatio());
        zoning.setComplianceStatus(request.getComplianceStatus());
        zoning.setRemarks(request.getRemarks());
    }

    // Flood Mappings
    public FloodInformationResponse toFloodInformationResponse(FloodInformation flood) {
        if (flood == null) {
            return null;
        }
        return FloodInformationResponse.builder()
                .floodId(flood.getFloodId())
                .propertyId(flood.getProperty() != null ? flood.getProperty().getPropertyId() : null)
                .propertyName(flood.getProperty() != null ? flood.getProperty().getPropertyName() : null)
                .floodZone(flood.getFloodZone())
                .floodRiskLevel(flood.getFloodRiskLevel())
                .insuranceRequired(flood.getInsuranceRequired())
                .lastVerified(flood.getLastVerified())
                .remarks(flood.getRemarks())
                .createdAt(flood.getCreatedAt())
                .updatedAt(flood.getUpdatedAt())
                .build();
    }

    public FloodInformation toFloodInformationEntity(FloodInformationRequest request) {
        if (request == null) {
            return null;
        }
        return FloodInformation.builder()
                .floodZone(request.getFloodZone())
                .floodRiskLevel(request.getFloodRiskLevel())
                .insuranceRequired(request.getInsuranceRequired())
                .lastVerified(request.getLastVerified())
                .remarks(request.getRemarks())
                .build();
    }

    public void updateFloodFromRequest(FloodInformationRequest request, FloodInformation flood) {
        if (request == null || flood == null) {
            return;
        }
        flood.setFloodZone(request.getFloodZone());
        flood.setFloodRiskLevel(request.getFloodRiskLevel());
        flood.setInsuranceRequired(request.getInsuranceRequired());
        flood.setLastVerified(request.getLastVerified());
        flood.setRemarks(request.getRemarks());
    }

    // Environmental Mappings
    public EnvironmentalRecordResponse toEnvironmentalRecordResponse(EnvironmentalRecord env) {
        if (env == null) {
            return null;
        }
        return EnvironmentalRecordResponse.builder()
                .environmentalId(env.getEnvironmentalId())
                .propertyId(env.getProperty() != null ? env.getProperty().getPropertyId() : null)
                .propertyName(env.getProperty() != null ? env.getProperty().getPropertyName() : null)
                .recordType(env.getRecordType())
                .riskLevel(env.getRiskLevel())
                .issuingAuthority(env.getIssuingAuthority())
                .reportDate(env.getReportDate())
                .description(env.getDescription())
                .reportUrl(env.getReportUrl())
                .createdAt(env.getCreatedAt())
                .updatedAt(env.getUpdatedAt())
                .build();
    }

    public EnvironmentalRecord toEnvironmentalRecordEntity(EnvironmentalRecordRequest request) {
        if (request == null) {
            return null;
        }
        return EnvironmentalRecord.builder()
                .recordType(request.getRecordType())
                .riskLevel(request.getRiskLevel())
                .issuingAuthority(request.getIssuingAuthority())
                .reportDate(request.getReportDate())
                .description(request.getDescription())
                .reportUrl(request.getReportUrl())
                .build();
    }

    public void updateEnvironmentalFromRequest(EnvironmentalRecordRequest request, EnvironmentalRecord env) {
        if (request == null || env == null) {
            return;
        }
        env.setRecordType(request.getRecordType());
        env.setRiskLevel(request.getRiskLevel());
        env.setIssuingAuthority(request.getIssuingAuthority());
        env.setReportDate(request.getReportDate());
        env.setDescription(request.getDescription());
        env.setReportUrl(request.getReportUrl());
    }

    // Utility Mappings
    public UtilityInformationResponse toUtilityInformationResponse(UtilityInformation util) {
        if (util == null) {
            return null;
        }
        return UtilityInformationResponse.builder()
                .utilityId(util.getUtilityId())
                .propertyId(util.getProperty() != null ? util.getProperty().getPropertyId() : null)
                .propertyName(util.getProperty() != null ? util.getProperty().getPropertyName() : null)
                .utilityType(util.getUtilityType())
                .providerName(util.getProviderName())
                .connectionStatus(util.getConnectionStatus())
                .accountReference(util.getAccountReference())
                .lastBillDate(util.getLastBillDate())
                .providerContact(util.getProviderContact())
                .createdAt(util.getCreatedAt())
                .updatedAt(util.getUpdatedAt())
                .build();
    }

    public UtilityInformation toUtilityInformationEntity(UtilityInformationRequest request) {
        if (request == null) {
            return null;
        }
        return UtilityInformation.builder()
                .utilityType(request.getUtilityType())
                .providerName(request.getProviderName())
                .connectionStatus(request.getConnectionStatus())
                .accountReference(request.getAccountReference())
                .lastBillDate(request.getLastBillDate())
                .providerContact(request.getProviderContact())
                .build();
    }

    public void updateUtilityFromRequest(UtilityInformationRequest request, UtilityInformation util) {
        if (request == null || util == null) {
            return;
        }
        util.setUtilityType(request.getUtilityType());
        util.setProviderName(request.getProviderName());
        util.setConnectionStatus(request.getConnectionStatus());
        util.setAccountReference(request.getAccountReference());
        util.setLastBillDate(request.getLastBillDate());
        util.setProviderContact(request.getProviderContact());
    }
}
