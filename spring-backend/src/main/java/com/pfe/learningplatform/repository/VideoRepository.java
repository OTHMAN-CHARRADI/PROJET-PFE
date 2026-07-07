package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.Video;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VideoRepository
        extends JpaRepository<Video, Long> {



    List<Video> findByCourseId(
            Long courseId
    );



    List<Video> findBySectionId(
            Long sectionId
    );
}