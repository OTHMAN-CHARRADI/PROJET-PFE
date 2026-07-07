package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.Section;
import com.pfe.learningplatform.model.StudentProgress;
import com.pfe.learningplatform.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentProgressRepository
        extends JpaRepository<StudentProgress, Long> {



    Optional<StudentProgress>
    findByStudentAndSection(

            User student,

            Section section
    );



    List<StudentProgress>
    findByStudent(User student);
}