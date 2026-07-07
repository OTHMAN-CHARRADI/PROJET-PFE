package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.CourseRequest;
import com.pfe.learningplatform.dto.CourseResponse;
import com.pfe.learningplatform.model.Course;
import com.pfe.learningplatform.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourService {

        private final CourseRepository courseRepository;

        public CourService(CourseRepository courseRepository) {
                this.courseRepository = courseRepository;
        }


        public CourseResponse createCourse(CourseRequest request) {
                Course course = Course.builder()
                                .title(request.getTitle())
                                .description(request.getDescription())
                                .build();
                return toDTO(courseRepository.save(course));
        }


        public List<CourseResponse> getAllCourses() {
                return courseRepository.findAll()
                                .stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }


        public CourseResponse getCourseById(Long id) {
                Course course = courseRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
                return toDTO(course);
        }


        public CourseResponse updateCourse(Long id, CourseRequest request) {
                Course course = courseRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
                if (request.getTitle() != null)
                        course.setTitle(request.getTitle());
                if (request.getDescription() != null)
                        course.setDescription(request.getDescription());
                return toDTO(courseRepository.save(course));
        }


        public void deleteCourse(Long id) {
                if (!courseRepository.existsById(id)) {
                        throw new RuntimeException("Cours non trouvé");
                }
                courseRepository.deleteById(id);
        }


        private CourseResponse toDTO(Course course) {
                return new CourseResponse(
                                course.getId(),
                                course.getTitle(),
                                course.getDescription());
        }
}