package com.pfe.learningplatform.dto;

import lombok.Data;

@Data
public class ContactRequest {
    private String name;
    private String email;
    private String subject;
    private String message;
}
