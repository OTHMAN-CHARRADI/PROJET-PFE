package com.pfe.learningplatform.model;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "videos")

@Getter
@Setter

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Video {



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;



    private String title;



    @Column(columnDefinition = "TEXT")
    private String description;



    private String youtubeUrl;



    private String thumbnailUrl;



    private Long courseId;



    private Long sectionId;
}