package com.pfe.learningplatform.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @ManyToOne
    private User student;



    @ManyToOne
    private Section section;



    private int currentLevel;



    private int completedQuizzes;



    private double averageScore;
}