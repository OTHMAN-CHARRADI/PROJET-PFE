package com.pfe.learningplatform.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "quiz_answer_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizAnswerRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "quiz_id")
    private QuizRecord quiz;

    @Column(columnDefinition = "TEXT")
    private String question;

    @Column(columnDefinition = "TEXT")
    private String userAnswer;

    @Column(columnDefinition = "TEXT")
    private String correctAnswer;

    private Boolean isCorrect;

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
