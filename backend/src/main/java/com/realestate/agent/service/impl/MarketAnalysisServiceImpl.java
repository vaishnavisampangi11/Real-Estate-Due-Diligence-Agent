package com.realestate.agent.service.impl;

import com.realestate.agent.dto.ComparablePropertyRequest;
import com.realestate.agent.dto.ComparablePropertyResponse;
import com.realestate.agent.entity.ComparableProperty;
import com.realestate.agent.entity.Property;
import com.realestate.agent.exception.BadRequestException;
import com.realestate.agent.exception.DuplicateResourceException;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.mapper.MarketAnalysisMapper;
import com.realestate.agent.repository.ComparablePropertyRepository;
import com.realestate.agent.repository.PropertyRepository;
import com.realestate.agent.service.MarketAnalysisService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MarketAnalysisServiceImpl implements MarketAnalysisService {

    private final ComparablePropertyRepository comparablePropertyRepository;
    private final PropertyRepository propertyRepository;
    private final MarketAnalysisMapper marketAnalysisMapper;

    public MarketAnalysisServiceImpl(
            ComparablePropertyRepository comparablePropertyRepository,
            PropertyRepository propertyRepository,
            MarketAnalysisMapper marketAnalysisMapper
    ) {
        this.comparablePropertyRepository = comparablePropertyRepository;
        this.propertyRepository = propertyRepository;
        this.marketAnalysisMapper = marketAnalysisMapper;
    }

    @Override
    @Transactional
    public ComparablePropertyResponse addComparableProperty(ComparablePropertyRequest request) {
        if (request.getPropertyId().equals(request.getComparablePropertyId())) {
            throw new BadRequestException("A property cannot be compared to itself.");
        }

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Primary property not found with ID: " + request.getPropertyId()));

        Property comparableProperty = propertyRepository.findById(request.getComparablePropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Comparable property not found with ID: " + request.getComparablePropertyId()));

        if (comparablePropertyRepository.existsByPropertyPropertyIdAndComparablePropertyPropertyId(
                request.getPropertyId(), request.getComparablePropertyId())) {
            throw new DuplicateResourceException("This comparable property relationship already exists.");
        }

        ComparableProperty cp = marketAnalysisMapper.toEntity(request);
        cp.setProperty(property);
        cp.setComparableProperty(comparableProperty);

        return marketAnalysisMapper.toResponse(comparablePropertyRepository.save(cp));
    }

    @Override
    @Transactional(readOnly = true)
    public ComparablePropertyResponse getComparablePropertyById(Long id) {
        ComparableProperty cp = comparablePropertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comparable property record not found with ID: " + id));
        return marketAnalysisMapper.toResponse(cp);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ComparablePropertyResponse> getComparablePropertiesForProperty(Long propertyId) {
        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found with ID: " + propertyId);
        }
        return comparablePropertyRepository.findByPropertyPropertyId(propertyId).stream()
                .map(marketAnalysisMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ComparablePropertyResponse updateComparableProperty(Long id, ComparablePropertyRequest request) {
        ComparableProperty cp = comparablePropertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comparable property record not found with ID: " + id));

        if (request.getPropertyId().equals(request.getComparablePropertyId())) {
            throw new BadRequestException("A property cannot be compared to itself.");
        }

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Primary property not found with ID: " + request.getPropertyId()));

        Property comparableProperty = propertyRepository.findById(request.getComparablePropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Comparable property not found with ID: " + request.getComparablePropertyId()));

        // Check if updating creates a duplicate relationship (excluding itself)
        if ((!cp.getProperty().getPropertyId().equals(request.getPropertyId()) ||
                !cp.getComparableProperty().getPropertyId().equals(request.getComparablePropertyId())) &&
                comparablePropertyRepository.existsByPropertyPropertyIdAndComparablePropertyPropertyId(
                        request.getPropertyId(), request.getComparablePropertyId())) {
            throw new DuplicateResourceException("This comparable property relationship already exists.");
        }

        marketAnalysisMapper.updateEntityFromRequest(request, cp);
        cp.setProperty(property);
        cp.setComparableProperty(comparableProperty);

        return marketAnalysisMapper.toResponse(comparablePropertyRepository.save(cp));
    }

    @Override
    @Transactional
    public void deleteComparableProperty(Long id) {
        ComparableProperty cp = comparablePropertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comparable property record not found with ID: " + id));
        comparablePropertyRepository.delete(cp);
    }
}
