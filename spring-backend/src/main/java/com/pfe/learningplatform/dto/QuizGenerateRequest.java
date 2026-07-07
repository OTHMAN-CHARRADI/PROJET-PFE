package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizGenerateRequest {
    private String topic;
    private String level = "débutant";
    private int num_questions = 10;
}