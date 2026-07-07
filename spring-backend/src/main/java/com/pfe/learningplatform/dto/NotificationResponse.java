package com.pfe.learningplatform.dto;

import com.pfe.learningplatform.model.Notification.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private NotificationType type;
    private String actorUsername;
    private String commentPreview;
    private Long commentId;
    private Long sectionId;
    private Long courseId;
    private boolean read;
    private LocalDateTime createdAt;
}
