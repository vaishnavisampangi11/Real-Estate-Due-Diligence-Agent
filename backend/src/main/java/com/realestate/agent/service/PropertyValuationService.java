package com.realestate.agent.service;

import com.realestate.agent.dto.PropertyValuationResponse;

public interface PropertyValuationService {

    PropertyValuationResponse generateValuation(Long propertyId);

}