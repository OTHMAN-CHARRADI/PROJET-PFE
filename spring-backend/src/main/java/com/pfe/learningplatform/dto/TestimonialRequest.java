package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TestimonialRequest {
    private String name;
    private String role;
    private String text;
    private int rating;
}