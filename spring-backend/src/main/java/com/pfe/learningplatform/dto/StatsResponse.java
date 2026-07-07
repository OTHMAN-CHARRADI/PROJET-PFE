package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsResponse {
    private int total_quizzes;
    private double average_score;
    private int topics_mastered;
    private String recommended_level;
    private int total_messages;
    private int sections_completed;
}