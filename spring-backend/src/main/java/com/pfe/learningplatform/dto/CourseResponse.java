package com.pfe.learningplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CourseResponse {

    private Long id;

    private String title;

    private String description;
}