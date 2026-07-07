package com.pfe.learningplatform.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressDataResponse {
    private String user_level;
    private List<TopicProgressItem> topics;
    private List<QuizHistoryItem> quiz_history;
    private List<CourseProgressItem> course_progress;
}