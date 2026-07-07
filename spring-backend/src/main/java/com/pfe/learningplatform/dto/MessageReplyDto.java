package com.pfe.learningplatform.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MessageReplyDto {
    private Long id;
    private String direction;
    private String senderName;
    private String text;
    private LocalDateTime sentAt;
}