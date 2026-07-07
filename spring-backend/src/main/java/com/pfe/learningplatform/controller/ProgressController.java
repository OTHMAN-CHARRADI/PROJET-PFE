package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.*;
import com.pfe.learningplatform.repository.UserRepository;
import com.pfe.learningplatform.service.NewProgressService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin(origins = "http://localhost:5173")
public class ProgressController {

        private final NewProgressService progressService;
        private final UserRepository userRepo;

        public ProgressController(NewProgressService progressService, UserRepository userRepo) {
                this.progressService = progressService;
                this.userRepo = userRepo;
        }

        private Long getUserId(UserDetails ud) {
                return userRepo.findByEmail(ud.getUsername())
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé")).getId();
        }

        @PostMapping("/sections/{sectionId}/complete")
        public ResponseEntity<Map<String, String>> markSectionCompleted(
                        @PathVariable Long sectionId,
                        @AuthenticationPrincipal UserDetails ud) {
                progressService.markSectionCompleted(getUserId(ud), sectionId);
                return ResponseEntity.ok(Map.of("message", "Section marquée comme complétée"));
        }

        @GetMapping("")
        public ResponseEntity<ProgressDataResponse> getProgress(
                        @AuthenticationPrincipal UserDetails ud) {
                return ResponseEntity.ok(progressService.getProgress(getUserId(ud)));
        }

        @GetMapping("/stats")
        public ResponseEntity<StatsResponse> getStats(
                        @AuthenticationPrincipal UserDetails ud) {
                return ResponseEntity.ok(progressService.getStats(getUserId(ud)));
        }

        @PostMapping("/reset-level")
        public ResponseEntity<Map<String, String>> resetLevel(
                        @AuthenticationPrincipal UserDetails ud) {
                progressService.resetLevel(getUserId(ud));
                return ResponseEntity.ok(Map.of("message", "Niveau réinitialisé", "level", "débutant"));
        }
}