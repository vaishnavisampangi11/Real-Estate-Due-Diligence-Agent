package com.realestate.agent.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskCategoryRequest {

    @NotBlank(message = "Category name is required")
    private String categoryName;

    private String description;

    @Builder.Default
    private Boolean isActive = true;
}
