package com.realestate.agent.service.impl;

import com.realestate.agent.dto.ComparablePropertyRequest;
import com.realestate.agent.dto.ComparablePropertyResponse;
import com.realestate.agent.entity.ComparableProperty;
import com.realestate.agent.entity.Property;
import com.realestate.agent.exception.DuplicateResourceException;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.ComparablePropertyMapper;
import com.realestate.agent.repository.ComparablePropertyRepository;
import com.realestate.agent.repository.PropertyRepository;
import com.realestate.agent.service.ComparablePropertyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

import com.realestate.agent.dto.ComparableAnalysisItem;
import com.realestate.agent.dto.ComparablePropertyAnalysisResponse;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;

@Service
public class ComparablePropertyServiceImpl implements ComparablePropertyService {

    private final ComparablePropertyRepository comparablePropertyRepository;
    private final PropertyRepository propertyRepository;
    private final ComparablePropertyMapper comparablePropertyMapper;

    public ComparablePropertyServiceImpl(
            ComparablePropertyRepository comparablePropertyRepository,
            PropertyRepository propertyRepository,
            ComparablePropertyMapper comparablePropertyMapper
    ) {
        this.comparablePropertyRepository = comparablePropertyRepository;
        this.propertyRepository = propertyRepository;
        this.comparablePropertyMapper = comparablePropertyMapper;
    }

    @Override
    @Transactional
    public ComparablePropertyResponse createComparableProperty(ComparablePropertyRequest request) {

        if (comparablePropertyRepository
                .existsByPropertyPropertyIdAndComparablePropertyPropertyId(
                        request.getPropertyId(),
                        request.getComparablePropertyId())) {

            throw new DuplicateResourceException(
                    "Comparable property already exists for this property.");
        }

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Property not found with ID: "
                                        + request.getPropertyId()));

        Property comparableProperty = propertyRepository
                .findById(request.getComparablePropertyId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Comparable Property not found with ID: "
                                        + request.getComparablePropertyId()));

        ComparableProperty comparable =
                comparablePropertyMapper.toEntity(request);

        comparable.setProperty(property);
        comparable.setComparableProperty(comparableProperty);

        ComparableProperty savedComparable =
                comparablePropertyRepository.save(comparable);

        return comparablePropertyMapper.toResponse(savedComparable);
    }

    @Override
    @Transactional(readOnly = true)
    public ComparablePropertyResponse getComparablePropertyById(Long id) {

        ComparableProperty comparable =
                comparablePropertyRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Comparable Property not found with ID: "
                                                + id));

        return comparablePropertyMapper.toResponse(comparable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComparablePropertyResponse> getComparablePropertiesByProperty(Long propertyId) {

        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException(
                    "Property not found with ID: " + propertyId);
        }

        return comparablePropertyRepository
                .findByPropertyPropertyId(propertyId)
                .stream()
                .map(comparablePropertyMapper::toResponse)
                .collect(Collectors.toList());
    }
    @Override
    @Transactional
    public ComparablePropertyResponse updateComparableProperty(
            Long id,
            ComparablePropertyRequest request) {

        ComparableProperty comparable =
                comparablePropertyRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Comparable Property not found with ID: "
                                                + id));

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Property not found with ID: "
                                        + request.getPropertyId()));

        Property comparableProperty =
                propertyRepository.findById(request.getComparablePropertyId())
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Comparable Property not found with ID: "
                                                + request.getComparablePropertyId()));

        comparablePropertyMapper.updateEntity(request, comparable);

        comparable.setProperty(property);
        comparable.setComparableProperty(comparableProperty);

        ComparableProperty updatedComparable =
                comparablePropertyRepository.save(comparable);

        return comparablePropertyMapper.toResponse(updatedComparable);
    }

    @Override
    @Transactional
    public void deleteComparableProperty(Long id) {

        ComparableProperty comparable =
                comparablePropertyRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Comparable Property not found with ID: "
                                                + id));

        comparablePropertyRepository.delete(comparable);
    }

    @Override
    @Transactional(readOnly = true)
    public ComparablePropertyAnalysisResponse analyzeComparableProperty(Long propertyId) {

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Property not found with ID: " + propertyId));

        List<ComparableProperty> comparables =
                comparablePropertyRepository.findByPropertyPropertyId(propertyId);

        if (comparables.isEmpty()) {
            throw new ResourceNotFoundException(
                    "No comparable properties found for property ID: " + propertyId);
        }

        List<ComparableAnalysisItem> analysisItems = new ArrayList<>();

        BigDecimal totalValue = BigDecimal.ZERO;
        BigDecimal highestValue = BigDecimal.ZERO;
        BigDecimal lowestValue = null;

        for (ComparableProperty comparable : comparables) {

            BigDecimal comparisonPrice = comparable.getComparisonPrice();

            totalValue = totalValue.add(comparisonPrice);

            if (comparisonPrice.compareTo(highestValue) > 0) {
                highestValue = comparisonPrice;
            }

            if (lowestValue == null || comparisonPrice.compareTo(lowestValue) < 0) {
                lowestValue = comparisonPrice;
            }

            BigDecimal difference =
                    property.getMarketValue().subtract(comparisonPrice).abs();

            Double areaDifference =
                    property.getTotalArea()
                            .subtract(comparable.getComparableProperty().getTotalArea())
                            .doubleValue();

            analysisItems.add(
                    ComparableAnalysisItem.builder()
                            .comparableId(comparable.getComparableId())
                            .comparablePropertyId(
                                    comparable.getComparableProperty().getPropertyId())
                            .comparablePropertyName(
                                    comparable.getComparableProperty().getPropertyName())
                            .comparisonPrice(comparisonPrice)
                            .marketValueDifference(difference)
                            .areaDifference(areaDifference)
                            .similarityScore(comparable.getSimilarityScore().doubleValue())
                            .distanceKm(comparable.getDistanceKm().doubleValue())
                            .remarks(comparable.getRemarks())
                            .build()
            );
        }

        BigDecimal average =
                totalValue.divide(
                        BigDecimal.valueOf(comparables.size()),
                        2,
                        RoundingMode.HALF_UP);

        return ComparablePropertyAnalysisResponse.builder()
                .propertyId(property.getPropertyId())
                .propertyName(property.getPropertyName())
                .propertyMarketValue(property.getMarketValue())
                .averageComparableValue(average)
                .highestComparableValue(highestValue)
                .lowestComparableValue(lowestValue)
                .estimatedMarketValue(average)
                .totalComparableProperties(comparables.size())
                .comparableProperties(analysisItems)
                .analysisSummary(
                        "Analysis completed successfully using "
                                + comparables.size()
                                + " comparable properties.")
                .build();
    }

}