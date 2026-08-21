package com.realestate.agent.repository;

import com.realestate.agent.entity.RiskCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RiskCategoryRepository extends JpaRepository<RiskCategory, Long> {
    Optional<RiskCategory> findByCategoryName(String categoryName);
    boolean existsByCategoryName(String categoryName);
}
