package com.pfe.learningplatform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;


    private String actorUsername;


    @Column(length = 300)
    private String commentPreview;


    private Long commentId;


    private Long sectionId;


    private Long courseId;

    @Column(name = "is_read")
    @Builder.Default
    private boolean read = false;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = LocalDateTime.now();
    }

    public enum NotificationType {
        LIKE, REPLY, PINNED, DELETED, SUPPORT_REPLY
    }
}