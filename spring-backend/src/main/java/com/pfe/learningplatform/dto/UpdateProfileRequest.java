package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {
    private String username;
    private String email;
    private String currentPassword;
    private String newPassword;
}