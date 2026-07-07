package com.pfe.learningplatform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quiz_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String topic;
    private String level;
    private Integer score;
    private Integer totalQuestions;
    private LocalDateTime takenAt;

    @PrePersist
    public void prePersist() {
        takenAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizAnswerRecord> answers = new ArrayList<>();
}