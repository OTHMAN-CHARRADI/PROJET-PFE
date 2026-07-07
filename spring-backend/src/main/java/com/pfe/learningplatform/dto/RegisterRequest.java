package com.pfe.learningplatform.dto;

import com.pfe.learningplatform.model.Role;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    private String username;
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private Role role;
    private String adminCode;
}