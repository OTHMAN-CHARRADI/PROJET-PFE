package com.pfe.learningplatform.dto;

import lombok.Data;


@Data
public class UnifiedReplyRequest {


    private String id;

    private UnifiedMessageResponse.Source source;


    private String replyText;


    private String toEmail;
    private String toName;
    private String originalSubject;
}
