package com.realestate.agent.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyDocumentRequest {

    @NotNull(message = "Property ID is required")
    private Long propertyId;

    private Long reportId;

    @NotBlank(message = "Document type is required")
    private String documentType;

    @NotBlank(message = "Document name is required")
    private String documentName;

    @NotBlank(message = "File path is required")
    private String filePath;

    private String fileFormat;
}
