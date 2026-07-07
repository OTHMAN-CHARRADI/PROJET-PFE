package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.QuizRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface QuizRecordRepository extends JpaRepository<QuizRecord, Long> {
    List<QuizRecord> findByUserIdOrderByTakenAtDesc(Long userId);

    void deleteByUserId(Long userId);
}