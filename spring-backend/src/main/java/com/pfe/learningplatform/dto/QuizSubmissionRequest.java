package com.pfe.learningplatform.dto;

import lombok.Data;

import java.util.Map;

@Data
public class QuizSubmissionRequest {



    private Long quizId;



    private Long studentId;



    private Map<Long, String> answers;
}