package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.SectionRequest;
import com.pfe.learningplatform.dto.SectionResponse;
import com.pfe.learningplatform.service.SectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sections")
@CrossOrigin(origins = "http://localhost:5173")
public class SectionController {

    private final SectionService sectionService;

    public SectionController(SectionService sectionService) {
        this.sectionService = sectionService;
    }


    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createSection(@RequestBody SectionRequest request) {
        try {
            return ResponseEntity.status(201).body(sectionService.createSection(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }


    @GetMapping
    public ResponseEntity<List<SectionResponse>> getAllSections() {
        return ResponseEntity.ok(sectionService.getAllSections());
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getSectionById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(sectionService.getSectionById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("detail", e.getMessage()));
        }
    }


    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<SectionResponse>> getSectionsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(sectionService.getSectionsByCourse(courseId));
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSection(@PathVariable Long id, @RequestBody SectionRequest request) {
        try {
            return ResponseEntity.ok(sectionService.updateSection(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("detail", e.getMessage()));
        }
    }


    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteSection(@PathVariable Long id) {
        try {
            sectionService.deleteSection(id);
            return ResponseEntity.ok(Map.of("message", "Section supprimée avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("detail", e.getMessage()));
        }
    }
}