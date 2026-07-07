package com.pfe.learningplatform.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String level;
    private String profilePicture;
    private LocalDateTime createdAt;
    private String role;
}