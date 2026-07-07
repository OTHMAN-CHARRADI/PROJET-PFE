package com.pfe.learningplatform.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserDetailResponse {


    private Long id;
    private String username;
    private String email;
    private String role;
    private String level;
    private String profilePicture;
    private LocalDateTime createdAt;


    private int totalQuizzes;
    private int totalExercises;
    private int totalChats;
    private int totalProgressTopics;


    private List<QuizSummary> recentQuizzes;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class QuizSummary {
        private String topic;
        private String level;
        private Integer score;
        private Integer totalQuestions;
        private LocalDateTime takenAt;
    }


    private List<ExerciseSummary> recentExercises;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExerciseSummary {
        private Long id;
        private String topic;
        private String level;
        private LocalDateTime createdAt;
    }


    private List<ProgressSummary> progress;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProgressSummary {
        private String topic;
        private Double masteryScore;
        private LocalDateTime lastUpdated;
    }


    private List<ChatSummary> recentChats;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatSummary {
        private Long id;
        private String title;
        private LocalDateTime createdAt;
    }
}