package com.pfe.learningplatform.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizHistoryItem {
    private Long id;
    private String topic;
    private String level;
    private Integer score;
    private Integer total_questions;
    private LocalDateTime taken_at;
}