package com.realestate.agent.dto;

import com.realestate.agent.enums.OwnerType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerRequest {

    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @Email(message = "Invalid email format")
    private String email;

    @Pattern(regexp = "^[0-9]{10,20}$", message = "Phone number must be between 10 and 20 digits")
    private String phone;

    @NotNull(message = "Owner type is required")
    private OwnerType ownerType;
}
