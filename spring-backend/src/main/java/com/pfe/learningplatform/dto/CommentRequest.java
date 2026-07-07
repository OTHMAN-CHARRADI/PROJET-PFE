package com.pfe.learningplatform.dto;

import lombok.Data;

@Data
public class CommentRequest {


    private String content;


    private Long courseId;


    private Long sectionId;


    private Long parentId;
}
