package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.Question;
import com.pfe.learningplatform.model.Quiz;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository
        extends JpaRepository<Question, Long> {



    List<Question> findByQuiz(Quiz quiz);
}