package com.pfe.learningplatform.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageResponse {
    private String role;
    private String content;
    private LocalDateTime createdAt;
    private Long conversationId;
}