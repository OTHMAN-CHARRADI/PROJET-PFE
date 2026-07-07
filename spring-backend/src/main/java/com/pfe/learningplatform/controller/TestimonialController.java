package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.TestimonialRequest;
import com.pfe.learningplatform.dto.TestimonialResponse;
import com.pfe.learningplatform.service.TestimonialService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/testimonials")
@CrossOrigin(origins = "http://localhost:5173")
public class TestimonialController {

    private final TestimonialService testimonialService;

    public TestimonialController(TestimonialService testimonialService) {
        this.testimonialService = testimonialService;
    }

    
    @GetMapping
    public ResponseEntity<List<TestimonialResponse>> getApproved() {
        return ResponseEntity.ok(testimonialService.getApprovedTestimonials());
    }

    
    @PostMapping
    public ResponseEntity<?> submit(@RequestBody TestimonialRequest request,
            Authentication auth) {
        try {
            if (request.getText() == null || request.getText().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("detail", "Le texte du témoignage est requis."));
            }
            if (request.getText().length() > 1000) {
                return ResponseEntity.badRequest()
                        .body(Map.of("detail", "Le texte ne doit pas dépasser 1000 caractères."));
            }
            TestimonialResponse saved = testimonialService.submitTestimonial(auth.getName(), request);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }
}