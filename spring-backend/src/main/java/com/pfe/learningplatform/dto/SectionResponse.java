package com.pfe.learningplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class SectionResponse {

    private Long id;

    private String title;

    private String content;

    private String videoUrl;

    private String summary;

    private Long courseId;

    private String courseTitle;
}