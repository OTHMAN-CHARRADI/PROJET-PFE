package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.Quiz;
import com.pfe.learningplatform.model.Section;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface QuizRepository
        extends JpaRepository<Quiz, Long> {


    List<Quiz> findBySection(Section section);



    List<Quiz> findByDifficulty(String difficulty);



    List<Quiz> findBySectionAndDifficulty(
            Section section,
            String difficulty
    );
}