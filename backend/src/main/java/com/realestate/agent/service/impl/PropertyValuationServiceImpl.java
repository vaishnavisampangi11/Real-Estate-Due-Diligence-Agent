package com.realestate.agent.service.impl;

import com.realestate.agent.dto.PropertyValuationResponse;
import com.realestate.agent.entity.ComparableProperty;
import com.realestate.agent.entity.Property;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.repository.ComparablePropertyRepository;
import com.realestate.agent.repository.PropertyRepository;
import com.realestate.agent.service.PropertyValuationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PropertyValuationServiceImpl implements PropertyValuationService {

    private final PropertyRepository propertyRepository;
    private final ComparablePropertyRepository comparablePropertyRepository;

    public PropertyValuationServiceImpl(
            PropertyRepository propertyRepository,
            ComparablePropertyRepository comparablePropertyRepository
    ) {
        this.propertyRepository = propertyRepository;
        this.comparablePropertyRepository = comparablePropertyRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyValuationResponse generateValuation(Long propertyId) {

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

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal highest = BigDecimal.ZERO;
        BigDecimal lowest = null;

        double totalSimilarity = 0;

        for (ComparableProperty comparable : comparables) {

            BigDecimal price = comparable.getComparisonPrice();

            total = total.add(price);

            if (price.compareTo(highest) > 0) {
                highest = price;
            }

            if (lowest == null || price.compareTo(lowest) < 0) {
                lowest = price;
            }

            totalSimilarity += comparable.getSimilarityScore().doubleValue();
        }

        BigDecimal average =
                total.divide(
                        BigDecimal.valueOf(comparables.size()),
                        2,
                        RoundingMode.HALF_UP);

        BigDecimal difference =
                property.getMarketValue().subtract(average);

        double percentage =
                difference
                        .divide(property.getMarketValue(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();

        double confidence =
                totalSimilarity / comparables.size();

        String status;

        if (percentage > 10) {
            status = "OVERVALUED";
        } else if (percentage < -10) {
            status = "UNDERVALUED";
        } else {
            status = "FAIRLY VALUED";
        }

        return PropertyValuationResponse.builder()
                .propertyId(property.getPropertyId())
                .propertyName(property.getPropertyName())
                .actualMarketValue(property.getMarketValue())
                .estimatedMarketValue(average)
                .averageComparableValue(average)
                .highestComparableValue(highest)
                .lowestComparableValue(lowest)
                .marketDifference(difference)
                .marketDifferencePercentage(percentage)
                .confidenceScore(confidence)
                .valuationStatus(status)
                .recommendation(
                        "Valuation generated using "
                                + comparables.size()
                                + " comparable properties.")
                .generatedAt(LocalDateTime.now())
                .build();
    }
}