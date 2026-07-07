package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.AdminStatsResponse;
import com.pfe.learningplatform.dto.AdminUserDetailResponse;
import com.pfe.learningplatform.dto.AdminUserResponse;
import com.pfe.learningplatform.dto.RoleUpdateRequest;
import com.pfe.learningplatform.dto.TestimonialResponse;
import com.pfe.learningplatform.service.AdminService;
import com.pfe.learningplatform.service.TestimonialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private final AdminService adminService;
    private final TestimonialService testimonialService;

    public AdminController(AdminService adminService, TestimonialService testimonialService) {
        this.adminService = adminService;
        this.testimonialService = testimonialService;
    }


    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }


    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }


    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable Long id,
            @RequestBody RoleUpdateRequest request) {
        try {
            return ResponseEntity.ok(adminService.updateUserRole(id, request.getRole()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }


    @GetMapping("/users/{id}/detail")
    public ResponseEntity<?> getUserDetail(@PathVariable Long id) {
        try {
            AdminUserDetailResponse detail = adminService.getUserDetail(id);
            return ResponseEntity.ok(detail);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("detail", e.getMessage()));
        }
    }


    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "Utilisateur supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("detail", e.getMessage()));
        }
    }



    @GetMapping("/testimonials")
    public ResponseEntity<List<TestimonialResponse>> getAllTestimonials() {
        return ResponseEntity.ok(testimonialService.getAllTestimonials());
    }


    @GetMapping("/testimonials/pending")
    public ResponseEntity<List<TestimonialResponse>> getPendingTestimonials() {
        return ResponseEntity.ok(testimonialService.getPendingTestimonials());
    }


    @PutMapping("/testimonials/{id}/approve")
    public ResponseEntity<?> approveTestimonial(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(testimonialService.approveTestimonial(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }


    @PutMapping("/testimonials/{id}/reject")
    public ResponseEntity<?> rejectTestimonial(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(testimonialService.rejectTestimonial(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }


    @DeleteMapping("/testimonials/{id}")
    public ResponseEntity<?> deleteTestimonial(@PathVariable Long id) {
        try {
            testimonialService.deleteTestimonial(id);
            return ResponseEntity.ok(Map.of("message", "Témoignage supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("detail", e.getMessage()));
        }
    }
}