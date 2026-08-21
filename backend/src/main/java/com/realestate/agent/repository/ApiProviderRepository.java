package com.realestate.agent.repository;

import com.realestate.agent.entity.ApiProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApiProviderRepository extends JpaRepository<ApiProvider, Long> {
    Optional<ApiProvider> findByProviderName(String providerName);
    boolean existsByProviderName(String providerName);
}
