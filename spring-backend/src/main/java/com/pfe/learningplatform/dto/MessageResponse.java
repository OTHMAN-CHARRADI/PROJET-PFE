package com.pfe.learningplatform.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {



    private Long id;



    private String content;



    private String sender;



    private LocalDateTime createdAt;
}