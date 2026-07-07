package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.ExerciseRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ExerciseRecordRepository extends JpaRepository<ExerciseRecord, Long> {
    List<ExerciseRecord> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Transactional
    void deleteByUserId(Long userId);
}