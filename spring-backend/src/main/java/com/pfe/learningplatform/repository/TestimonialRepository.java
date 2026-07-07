package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.Testimonial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestimonialRepository extends JpaRepository<Testimonial, Long> {

    
    List<Testimonial> findByApprovedTrueOrderByCreatedAtDesc();

    
    List<Testimonial> findByApprovedFalseAndRejectedFalseOrderByCreatedAtDesc();

    
    List<Testimonial> findByRejectedTrueOrderByCreatedAtDesc();

    
    List<Testimonial> findAllByOrderByCreatedAtDesc();
}