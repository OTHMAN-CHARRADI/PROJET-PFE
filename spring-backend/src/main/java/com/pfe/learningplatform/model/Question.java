package com.pfe.learningplatform.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    @Column(length = 1000)
    private String question;



    private String optionA;

    private String optionB;

    private String optionC;

    private String optionD;



    private String correctAnswer;



    @ManyToOne

    @JoinColumn(name = "quiz_id")

    private Quiz quiz;
}