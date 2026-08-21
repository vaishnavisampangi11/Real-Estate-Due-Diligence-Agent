package com.realestate.agent.service.impl;

import com.realestate.agent.entity.Address;
import com.realestate.agent.exception.ResourceNotFoundException;
import com.realestate.agent.repository.AddressRepository;
import com.realestate.agent.service.AddressValidationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

@Service
public class AddressValidationServiceImpl implements AddressValidationService {

    private static final Pattern INDIA_POSTAL_CODE_PATTERN = Pattern.compile("^[1-9][0-9]{5}$");

    private final AddressRepository addressRepository;

    public AddressValidationServiceImpl(AddressRepository addressRepository) {
        this.addressRepository = addressRepository;
    }

    @Override
    @Transactional
    public boolean validateAddress(Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with ID: " + addressId));

        boolean isValid = performValidation(address);
        address.setValidationStatus(isValid);
        addressRepository.save(address);

        return isValid;
    }

    private boolean performValidation(Address address) {
        if (!StringUtils.hasText(address.getAddressLine1()) ||
                !StringUtils.hasText(address.getCity()) ||
                !StringUtils.hasText(address.getState()) ||
                !StringUtils.hasText(address.getCountry()) ||
                !StringUtils.hasText(address.getPostalCode())) {
            return false;
        }

        // Validate postal code pattern if the country is India
        if ("India".equalsIgnoreCase(address.getCountry().trim())) {
            String trimmedCode = address.getPostalCode().trim();
            return INDIA_POSTAL_CODE_PATTERN.matcher(trimmedCode).matches();
        }

        // Return true if all required fields are present for other countries
        return true;
    }
}
