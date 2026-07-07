package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {

    private Long id;

    private String question;

    private String optionA;

    private String optionB;

    private String optionC;

    private String optionD;
}