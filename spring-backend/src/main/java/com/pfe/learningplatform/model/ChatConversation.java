package com.pfe.learningplatform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatConversation {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        private String title;
        private Long userId;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
        private List<ChatMessage> messages = new ArrayList<>();

        @PrePersist
        public void prePersist() {
                createdAt = LocalDateTime.now();
                updatedAt = LocalDateTime.now();
        }

        @PreUpdate
        public void preUpdate() {
                updatedAt = LocalDateTime.now();
        }
}