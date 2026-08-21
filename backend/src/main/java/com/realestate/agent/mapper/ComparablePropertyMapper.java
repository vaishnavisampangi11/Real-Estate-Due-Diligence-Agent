package com.realestate.agent.mapper;

import com.realestate.agent.dto.ComparablePropertyRequest;
import com.realestate.agent.dto.ComparablePropertyResponse;
import com.realestate.agent.entity.ComparableProperty;
import org.springframework.stereotype.Component;

@Component
public class ComparablePropertyMapper {

    public ComparableProperty toEntity(ComparablePropertyRequest request) {

        return ComparableProperty.builder()
                .distanceKm(request.getDistanceKm())
                .similarityScore(request.getSimilarityScore())
                .comparisonPrice(request.getComparisonPrice())
                .comparisonDate(request.getComparisonDate())
                .remarks(request.getRemarks())
                .build();
    }

    public ComparablePropertyResponse toResponse(ComparableProperty entity) {

        return ComparablePropertyResponse.builder()
                .comparableId(entity.getComparableId())

                .propertyId(entity.getProperty().getPropertyId())
                .propertyName(entity.getProperty().getPropertyName())

                .comparablePropertyId(entity.getComparableProperty().getPropertyId())
                .comparablePropertyName(entity.getComparableProperty().getPropertyName())

                .distanceKm(entity.getDistanceKm())
                .similarityScore(entity.getSimilarityScore())
                .comparisonPrice(entity.getComparisonPrice())
                .comparisonDate(entity.getComparisonDate())
                .remarks(entity.getRemarks())

                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateEntity(
            ComparablePropertyRequest request,
            ComparableProperty entity) {

        entity.setDistanceKm(request.getDistanceKm());
        entity.setSimilarityScore(request.getSimilarityScore());
        entity.setComparisonPrice(request.getComparisonPrice());
        entity.setComparisonDate(request.getComparisonDate());
        entity.setRemarks(request.getRemarks());
    }
}