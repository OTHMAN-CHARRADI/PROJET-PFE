package com.pfe.learningplatform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;


    private String role;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "conversation_id")
    private ChatConversation conversation;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}