package com.realestate.agent.mapper;

import com.realestate.agent.dto.OwnerRequest;
import com.realestate.agent.dto.OwnerResponse;
import com.realestate.agent.dto.OwnershipRecordResponse;
import com.realestate.agent.entity.Owner;
import com.realestate.agent.entity.OwnershipRecord;
import org.springframework.stereotype.Component;

@Component
public class OwnerMapper {

    public OwnerResponse toOwnerResponse(Owner owner) {
        if (owner == null) {
            return null;
        }
        return OwnerResponse.builder()
                .ownerId(owner.getOwnerId())
                .ownerName(owner.getOwnerName())
                .email(owner.getEmail())
                .phone(owner.getPhone())
                .ownerType(owner.getOwnerType())
                .isActive(owner.getIsActive())
                .createdAt(owner.getCreatedAt())
                .updatedAt(owner.getUpdatedAt())
                .build();
    }

    public Owner toOwnerEntity(OwnerRequest request) {
        if (request == null) {
            return null;
        }
        return Owner.builder()
                .ownerName(request.getOwnerName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .ownerType(request.getOwnerType())
                .isActive(true)
                .build();
    }

    public void updateOwnerFromRequest(OwnerRequest request, Owner owner) {
        if (request == null || owner == null) {
            return;
        }
        owner.setOwnerName(request.getOwnerName());
        owner.setEmail(request.getEmail());
        owner.setPhone(request.getPhone());
        owner.setOwnerType(request.getOwnerType());
    }

    public OwnershipRecordResponse toOwnershipRecordResponse(OwnershipRecord record) {
        if (record == null) {
            return null;
        }
        return OwnershipRecordResponse.builder()
                .ownershipId(record.getOwnershipId())
                .propertyId(record.getProperty() != null ? record.getProperty().getPropertyId() : null)
                .propertyName(record.getProperty() != null ? record.getProperty().getPropertyName() : null)
                .ownerId(record.getOwner() != null ? record.getOwner().getOwnerId() : null)
                .ownerName(record.getOwner() != null ? record.getOwner().getOwnerName() : null)
                .ownershipPercentage(record.getOwnershipPercentage())
                .purchaseDate(record.getPurchaseDate())
                .saleDate(record.getSaleDate())
                .isCurrentOwner(record.getIsCurrentOwner())
                .verificationStatus(record.getVerificationStatus())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
