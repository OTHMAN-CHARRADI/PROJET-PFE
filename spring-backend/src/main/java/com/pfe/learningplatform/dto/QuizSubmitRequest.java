package com.pfe.learningplatform.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitRequest {
    private String topic;
    private String level;
    private List<QuizAnswerDto> answers;
}