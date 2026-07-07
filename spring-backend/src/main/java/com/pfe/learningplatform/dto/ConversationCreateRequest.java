package com.pfe.learningplatform.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationCreateRequest {
    private String title = "Nouvelle conversation";
}