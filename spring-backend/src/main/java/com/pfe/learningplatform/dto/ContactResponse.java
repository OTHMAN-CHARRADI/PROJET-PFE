package com.pfe.learningplatform.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ContactResponse {
    private Long id;
    private String name;
    private String email;
    private String subject;
    private String message;
    private boolean read;
    private boolean replied;
    private String replyText;
    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;
}
