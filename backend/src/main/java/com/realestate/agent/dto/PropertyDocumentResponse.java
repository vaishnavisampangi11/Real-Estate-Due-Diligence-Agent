package com.realestate.agent.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDocumentResponse {
    private Long documentId;
    private Long propertyId;
    private String propertyName;
    private Long reportId;
    private String reportName;
    private String documentType;
    private String documentName;
    private String filePath;
    private String fileFormat;
    private Long uploadedByUserId;
    private String uploadedByUserEmail;
    private LocalDateTime uploadedAt;
}
