package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequest {



    private String message;



    private Long userId;



    private Long conversationId;
}