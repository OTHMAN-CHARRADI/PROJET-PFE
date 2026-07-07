package com.pfe.learningplatform.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponse {

    private Long id;

    private String difficulty;

    private List<QuestionResponse> questions;
}