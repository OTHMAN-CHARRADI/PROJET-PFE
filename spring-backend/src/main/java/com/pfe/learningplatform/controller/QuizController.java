package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.*;
import com.pfe.learningplatform.repository.UserRepository;
import com.pfe.learningplatform.service.NewQuizService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@CrossOrigin(origins = "http://localhost:5173")
public class QuizController {

        private final NewQuizService quizService;
        private final UserRepository userRepo;

        public QuizController(NewQuizService quizService, UserRepository userRepo) {
                this.quizService = quizService;
                this.userRepo = userRepo;
        }

        private Long getUserId(UserDetails ud) {
                return userRepo.findByEmail(ud.getUsername())
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé")).getId();
        }

        @PostMapping("/generate")
        public ResponseEntity<?> generateQuiz(
                        @AuthenticationPrincipal UserDetails ud,
                        @RequestBody QuizGenerateRequest request) {
                try {
                        return ResponseEntity.ok(quizService.generateQuiz(getUserId(ud), request));
                } catch (RuntimeException e) {
                        return ResponseEntity.status(500).body(Map.of("detail", e.getMessage()));
                }
        }

        @PostMapping("/submit")
        public ResponseEntity<QuizResultResponse> submitQuiz(
                        @AuthenticationPrincipal UserDetails ud,
                        @RequestBody QuizSubmitRequest request) {
                return ResponseEntity.ok(quizService.submitQuiz(getUserId(ud), request));
        }

        @GetMapping("/history")
        public ResponseEntity<List<QuizHistoryItem>> getHistory(
                        @AuthenticationPrincipal UserDetails ud) {
                return ResponseEntity.ok(quizService.getHistory(getUserId(ud)));
        }

        @GetMapping("/history/{id}")
        public ResponseEntity<?> getQuizDetail(
                        @AuthenticationPrincipal UserDetails ud,
                        @PathVariable Long id) {
                try {
                        return ResponseEntity.ok(quizService.getQuizDetail(getUserId(ud), id));
                } catch (RuntimeException e) {
                        return ResponseEntity.status(403).body(Map.of("detail", e.getMessage()));
                }
        }

        @DeleteMapping("/history")
        public ResponseEntity<Map<String, String>> deleteHistory(
                        @AuthenticationPrincipal UserDetails ud) {
                quizService.deleteHistory(getUserId(ud));
                return ResponseEntity.ok(Map.of("message", "Historique supprimé avec succès"));
        }
}