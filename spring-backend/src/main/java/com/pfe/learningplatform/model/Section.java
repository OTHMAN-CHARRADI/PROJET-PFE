package com.pfe.learningplatform.model;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Section {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String title;


    @Column(length = 5000)
    private String content;


    private String videoUrl;


    @Column(length = 3000)
    private String summary;


    @ManyToOne

    @JoinColumn(name = "course_id")

    private Course course;
}