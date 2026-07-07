package com.pfe.learningplatform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "progress_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String topic;
    private Double masteryScore;
    private LocalDateTime lastUpdated;

    @PrePersist
    @PreUpdate
    public void update() {
        lastUpdated = LocalDateTime.now();
    }
}