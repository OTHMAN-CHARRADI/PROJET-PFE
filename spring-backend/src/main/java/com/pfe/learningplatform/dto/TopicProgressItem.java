package com.pfe.learningplatform.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopicProgressItem {
    private String topic;
    private Double mastery_score;
    private LocalDateTime last_updated;
}