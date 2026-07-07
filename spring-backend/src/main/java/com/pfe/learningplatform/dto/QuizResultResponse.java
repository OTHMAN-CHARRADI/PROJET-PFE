package com.pfe.learningplatform.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizResultResponse {
    private Long quiz_id;
    private String topic;
    private String level;
    private int score;
    private int total_questions;
    private double percentage;
    private List<QuizResultDetail> details;
}