package com.pfe.learningplatform.dto;

import lombok.Data;

@Data
public class SectionRequest {


    private String title;


    private String content;


    private String videoUrl;


    private String summary;


    private Long courseId;
}