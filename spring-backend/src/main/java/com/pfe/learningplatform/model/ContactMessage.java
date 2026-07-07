package com.pfe.learningplatform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "contact_messages")
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String subject;

    @Column(length = 5000, nullable = false)
    private String message;


    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(name = "is_replied", nullable = false)
    private boolean replied = false;

    @Column(name = "reply_text", length = 5000)
    private String replyText;

    @Column(name = "replied_at")
    private LocalDateTime repliedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = LocalDateTime.now();
    }
}