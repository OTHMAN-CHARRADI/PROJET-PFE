package com.pfe.learningplatform.dto;

import lombok.Data;
import java.time.LocalDateTime;
import com.pfe.learningplatform.dto.MessageReplyDto;
import java.util.List;
import java.util.ArrayList;


@Data
public class UnifiedMessageResponse {


    public enum Source {
        CONTACT_FORM, GMAIL_INBOX
    }



    private Source source;


    private String id;

    private String fromName;
    private String fromEmail;
    private String subject;
    private String body;
    private LocalDateTime date;


    private boolean read;




    private Boolean replied;


    private String replyText;

    private LocalDateTime repliedAt;




    private String bodyType;


    private String replyToEmail;
    private String replyToName;


    private List<MessageReplyDto> replies = new ArrayList<>();
}