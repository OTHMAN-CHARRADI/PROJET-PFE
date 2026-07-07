package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.SectionCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SectionCompletionRepository extends JpaRepository<SectionCompletion, Long> {

    List<SectionCompletion> findByUserId(Long userId);

    Optional<SectionCompletion> findByUserIdAndSectionId(Long userId, Long sectionId);

    boolean existsByUserIdAndSectionId(Long userId, Long sectionId);


    @Query("SELECT COUNT(sc) FROM SectionCompletion sc WHERE sc.userId = :userId AND sc.section.course.id = :courseId")
    long countByUserIdAndCourseId(@Param("userId") Long userId, @Param("courseId") Long courseId);


    @Query("SELECT sc FROM SectionCompletion sc WHERE sc.userId = :userId AND sc.section.course.id = :courseId")
    List<SectionCompletion> findByUserIdAndCourseId(@Param("userId") Long userId, @Param("courseId") Long courseId);
}
