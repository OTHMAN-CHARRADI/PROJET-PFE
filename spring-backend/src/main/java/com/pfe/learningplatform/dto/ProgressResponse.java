package com.pfe.learningplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProgressResponse {



    private String courseName;



    private String sectionName;



    private int currentLevel;



    private int completedQuizzes;



    private double averageScore;



    private String message;
}