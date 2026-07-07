package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoResponse {

    private Long id;

    private String title;

    private String description;

    private String youtubeUrl;

    private String thumbnailUrl;

    private Long courseId;

    private Long sectionId;
}