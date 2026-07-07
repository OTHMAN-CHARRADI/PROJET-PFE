package com.pfe.learningplatform.model;

import jakarta.persistence.*;

import lombok.*;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    private String title;


    @Column(columnDefinition = "TEXT")
    private String description;


    @OneToMany(mappedBy = "course")

    private List<Section> sections;
}