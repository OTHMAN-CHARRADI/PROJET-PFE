package com.pfe.learningplatform.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestimonialResponse {
    private Long id;
    private String name;
    private String role;
    private String text;
    private int rating;
    private String avatar;
    private String color;
    private boolean approved;
    private boolean rejected;
    private LocalDateTime createdAt;
    private Long userId;
}