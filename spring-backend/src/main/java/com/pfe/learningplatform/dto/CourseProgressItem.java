package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseProgressItem {
    private Long courseId;
    private String courseTitle;
    private int totalSections;
    private int completedSections;
    private double progressPercent;
}
