package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAnswerDto {
    private String question;
    private String user_answer;
    private String correct_answer;
    private String explanation;
}