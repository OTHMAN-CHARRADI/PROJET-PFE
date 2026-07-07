package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.ProgressRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProgressRecordRepository extends JpaRepository<ProgressRecord, Long> {
    List<ProgressRecord> findByUserId(Long userId);

    Optional<ProgressRecord> findByUserIdAndTopic(Long userId, String topic);
}