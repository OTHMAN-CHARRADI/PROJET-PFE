package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.CommentRequest;
import com.pfe.learningplatform.dto.CommentResponse;
import com.pfe.learningplatform.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:5173")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }


    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<CommentResponse>> getCourseComments(@PathVariable Long courseId) {
        return ResponseEntity.ok(commentService.getCourseComments(courseId));
    }


    @GetMapping("/section/{sectionId}")
    public ResponseEntity<List<CommentResponse>> getSectionComments(@PathVariable Long sectionId) {
        return ResponseEntity.ok(commentService.getSectionComments(sectionId));
    }


    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody CommentRequest request,
                                        Authentication auth) {
        try {
            return ResponseEntity.status(201).body(commentService.addComment(auth.getName(), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id,
                                            @RequestBody Map<String, String> body,
                                            Authentication auth) {
        try {
            String newContent = body.get("content");
            return ResponseEntity.ok(commentService.updateComment(auth.getName(), id, newContent));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id, Authentication auth) {
        try {
            commentService.deleteComment(auth.getName(), id);
            return ResponseEntity.ok(Map.of("message", "Commentaire supprimé"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }


    @PostMapping("/{id}/like")
    public ResponseEntity<?> toggleLike(@PathVariable Long id, Authentication auth) {
        try {
            return ResponseEntity.ok(commentService.toggleLike(auth.getName(), id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }


    @PostMapping("/{id}/pin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> togglePin(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(commentService.togglePin(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }


    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CommentResponse>> getAllComments() {
        return ResponseEntity.ok(commentService.getAllComments());
    }
}
