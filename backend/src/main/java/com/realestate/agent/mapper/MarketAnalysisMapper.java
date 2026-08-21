package com.realestate.agent.mapper;

import com.realestate.agent.dto.ComparablePropertyRequest;
import com.realestate.agent.dto.ComparablePropertyResponse;
import com.realestate.agent.entity.ComparableProperty;
import org.springframework.stereotype.Component;

@Component
public class MarketAnalysisMapper {

    public ComparablePropertyResponse toResponse(ComparableProperty cp) {
        if (cp == null) {
            return null;
        }
        return ComparablePropertyResponse.builder()
                .comparableId(cp.getComparableId())
                .propertyId(cp.getProperty() != null ? cp.getProperty().getPropertyId() : null)
                .propertyName(cp.getProperty() != null ? cp.getProperty().getPropertyName() : null)
                .comparablePropertyId(cp.getComparableProperty() != null ? cp.getComparableProperty().getPropertyId() : null)
                .comparablePropertyName(cp.getComparableProperty() != null ? cp.getComparableProperty().getPropertyName() : null)
                .distanceKm(cp.getDistanceKm())
                .similarityScore(cp.getSimilarityScore())
                .comparisonPrice(cp.getComparisonPrice())
                .comparisonDate(cp.getComparisonDate())
                .remarks(cp.getRemarks())
                .createdAt(cp.getCreatedAt())
                .updatedAt(cp.getUpdatedAt())
                .build();
    }

    public ComparableProperty toEntity(ComparablePropertyRequest request) {
        if (request == null) {
            return null;
        }
        return ComparableProperty.builder()
                .distanceKm(request.getDistanceKm())
                .similarityScore(request.getSimilarityScore())
                .comparisonPrice(request.getComparisonPrice())
                .comparisonDate(request.getComparisonDate())
                .remarks(request.getRemarks())
                .build();
    }

    public void updateEntityFromRequest(ComparablePropertyRequest request, ComparableProperty cp) {
        if (request == null || cp == null) {
            return;
        }
        cp.setDistanceKm(request.getDistanceKm());
        cp.setSimilarityScore(request.getSimilarityScore());
        cp.setComparisonPrice(request.getComparisonPrice());
        cp.setComparisonDate(request.getComparisonDate());
        cp.setRemarks(request.getRemarks());
    }
}
