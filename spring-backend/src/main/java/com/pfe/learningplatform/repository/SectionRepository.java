package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.Section;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SectionRepository
        extends JpaRepository<Section, Long> {


    List<Section> findByCourse_Id(Long courseId);
}