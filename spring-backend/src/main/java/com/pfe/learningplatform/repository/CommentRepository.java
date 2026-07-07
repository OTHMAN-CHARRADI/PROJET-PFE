package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {


    List<Comment> findByCourseIdAndParentIsNullOrderByPinnedDescCreatedAtAsc(Long courseId);


    List<Comment> findBySectionIdAndParentIsNullOrderByPinnedDescCreatedAtAsc(Long sectionId);


    List<Comment> findByCourseIdOrderByCreatedAtDesc(Long courseId);


    List<Comment> findBySectionIdOrderByCreatedAtDesc(Long sectionId);


    List<Comment> findAllByOrderByCreatedAtDesc();
}
