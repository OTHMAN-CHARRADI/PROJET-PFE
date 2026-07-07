package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResultDetail {
    private String question;
    private String user_answer;
    private String correct_answer;
    private boolean is_correct;
    private String explanation;
}