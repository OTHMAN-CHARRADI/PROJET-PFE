package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalCourses;
    private long totalSections;
    private long totalVideos;
    private long totalQuizzes;
    private long totalMessages;
    private long totalExercises;
}