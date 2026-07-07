package com.pfe.learningplatform.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    private String message;
    private Long conversationId;
    private List<String> attachments;
}