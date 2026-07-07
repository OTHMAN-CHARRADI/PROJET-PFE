package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.*;
import com.pfe.learningplatform.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.status(201).body(authService.register(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("detail", "Email ou mot de passe incorrect"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getMe(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateProfileRequest request) {
        try {
            return ResponseEntity.ok(authService.updateProfile(userDetails.getUsername(), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }

    @PostMapping("/avatar")
    public ResponseEntity<UserResponse> uploadAvatar(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(authService.uploadAvatar(userDetails.getUsername(), file));
    }

    @DeleteMapping("/avatar")
    public ResponseEntity<UserResponse> deleteAvatar(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.deleteAvatar(userDetails.getUsername()));
    }

    @DeleteMapping("/account")
    public ResponseEntity<Map<String, String>> deleteAccount(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody DeleteAccountRequest request) {
        try {
            authService.deleteAccount(userDetails.getUsername(), request.getPassword());
            return ResponseEntity.ok(Map.of("message", "Compte supprimé avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}