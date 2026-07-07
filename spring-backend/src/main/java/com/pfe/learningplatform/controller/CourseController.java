package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.CourseRequest;
import com.pfe.learningplatform.dto.CourseResponse;
import com.pfe.learningplatform.service.CourService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:5173")
public class CourseController {

    private final CourService courseService;

    public CourseController(CourService courseService) {
        this.courseService = courseService;
    }


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCourse(@RequestBody CourseRequest request) {
        try {
            return ResponseEntity.status(201).body(courseService.createCourse(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }


    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getCourseById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(courseService.getCourseById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("detail", e.getMessage()));
        }
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @RequestBody CourseRequest request) {
        try {
            return ResponseEntity.ok(courseService.updateCourse(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("detail", e.getMessage()));
        }
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            courseService.deleteCourse(id);
            return ResponseEntity.ok(Map.of("message", "Cours supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("detail", e.getMessage()));
        }
    }
}