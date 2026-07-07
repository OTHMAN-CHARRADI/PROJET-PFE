package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.VideoRequest;
import com.pfe.learningplatform.dto.VideoResponse;
import com.pfe.learningplatform.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class VideoController {

        private final VideoService videoService;


        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> createVideo(@RequestBody VideoRequest request) {
                try {
                        return ResponseEntity.status(201).body(videoService.createVideo(request));
                } catch (RuntimeException e) {
                        return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
                }
        }


        @GetMapping
        public ResponseEntity<List<VideoResponse>> getAllVideos() {
                return ResponseEntity.ok(videoService.getAllVideos());
        }


        @GetMapping("/{id}")
        public ResponseEntity<?> getVideoById(@PathVariable Long id) {
                try {
                        return ResponseEntity.ok(videoService.getVideoById(id));
                } catch (RuntimeException e) {
                        return ResponseEntity.status(404).body(Map.of("detail", e.getMessage()));
                }
        }


        @GetMapping("/course/{courseId}")
        public ResponseEntity<List<VideoResponse>> getVideosByCourse(@PathVariable Long courseId) {
                return ResponseEntity.ok(videoService.getVideosByCourse(courseId));
        }


        @GetMapping("/section/{sectionId}")
        public ResponseEntity<List<VideoResponse>> getVideosBySection(@PathVariable Long sectionId) {
                return ResponseEntity.ok(videoService.getVideosBySection(sectionId));
        }


        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<?> deleteVideo(@PathVariable Long id) {
                try {
                        videoService.deleteVideo(id);
                        return ResponseEntity.ok(Map.of("message", "Vidéo supprimée avec succès"));
                } catch (RuntimeException e) {
                        return ResponseEntity.status(404).body(Map.of("detail", e.getMessage()));
                }
        }
}