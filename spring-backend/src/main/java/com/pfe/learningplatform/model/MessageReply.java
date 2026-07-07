package com.pfe.learningplatform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "message_replies")
public class MessageReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_message_id", nullable = false)
    private ContactMessage contactMessage;

    
    @Column(nullable = false, length = 10)
    private String direction;

    
    @Column(nullable = false)
    private String senderName;

    @Column(length = 5000, nullable = false)
    private String text;

    @Column(name = "sent_at", updatable = false)
    private LocalDateTime sentAt;

    @PrePersist
    public void prePersist() {
        if (sentAt == null)
            sentAt = LocalDateTime.now();
    }
}