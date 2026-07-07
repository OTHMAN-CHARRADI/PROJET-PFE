package com.pfe.learningplatform.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizDetailResponse {
    private Long id;
    private String topic;
    private String level;
    private Integer score;
    private Integer total_questions;
    private LocalDateTime taken_at;
    private List<QuizResultDetail> details;
}
