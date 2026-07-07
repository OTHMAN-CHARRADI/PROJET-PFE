package com.pfe.learningplatform.dto;

import lombok.*;
import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatSaveRequest {
    private String userMessage;
    private String assistantMessage;
    private Long conversationId;
    private List<String> attachments;
}