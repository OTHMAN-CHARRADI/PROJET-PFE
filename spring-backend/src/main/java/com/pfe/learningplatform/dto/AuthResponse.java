package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String access_token;
    private String token_type;

    public AuthResponse(String token) {
        this.access_token = token;
        this.token_type = "bearer";
    }
}