package com.realestate.agent.repository;

import com.realestate.agent.entity.PropertyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyDocumentRepository extends JpaRepository<PropertyDocument, Long> {
    List<PropertyDocument> findByPropertyPropertyId(Long propertyId);
    List<PropertyDocument> findByReportReportId(Long reportId);
    List<PropertyDocument> findByUploadedByUserId(Long userId);
}
