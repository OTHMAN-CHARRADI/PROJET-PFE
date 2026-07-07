package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.*;
import com.pfe.learningplatform.model.User;
import com.pfe.learningplatform.repository.UserRepository;
import com.pfe.learningplatform.service.NewChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final NewChatService chatService;
    private final UserRepository userRepo;

    public ChatController(NewChatService chatService, UserRepository userRepo) {
        this.chatService = chatService;
        this.userRepo = userRepo;
    }

    private Long getUserId(UserDetails userDetails) {
        return userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"))
                .getId();
    }



    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> listConversations(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(chatService.listConversations(getUserId(ud)));
    }

    @PostMapping("/conversations")
    public ResponseEntity<ConversationResponse> createConversation(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody ConversationCreateRequest req) {
        return ResponseEntity.ok(chatService.createConversation(getUserId(ud), req.getTitle()));
    }

    @PutMapping("/conversations/{id}")
    public ResponseEntity<ConversationResponse> renameConversation(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @RequestBody ConversationRenameRequest req) {
        return ResponseEntity.ok(chatService.renameConversation(id, getUserId(ud), req.getTitle()));
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Map<String, String>> deleteConversation(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id) {
        chatService.deleteConversation(id, getUserId(ud));
        return ResponseEntity.ok(Map.of("message", "Conversation supprimée"));
    }

    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<List<ChatMessageResponse>> getMessages(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id) {
        return ResponseEntity.ok(chatService.getConversationMessages(id, getUserId(ud)));
    }



    @PostMapping("/save")
    public ResponseEntity<ChatMessageResponse> saveStreamedMessage(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody ChatSaveRequest req) {
        return ResponseEntity.ok(chatService.saveStreamedMessages(getUserId(ud), req));
    }



    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(chatService.uploadFile(file));
    }



    @PostMapping("/message")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody ChatMessageRequest req) {
        return ResponseEntity.ok(chatService.sendMessage(getUserId(ud), req));
    }

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageResponse>> getHistory(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(chatService.getChatHistory(getUserId(ud)));
    }

    @DeleteMapping("/history")
    public ResponseEntity<Map<String, String>> deleteHistory(
            @AuthenticationPrincipal UserDetails ud) {
        chatService.deleteHistory(getUserId(ud));
        return ResponseEntity.ok(Map.of("message", "Historique effacé"));
    }



    @PostMapping("/exercise")
    public ResponseEntity<Map<String, String>> generateExercise(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody Map<String, String> req) {
        return ResponseEntity.ok(chatService.generateExercise(
                getUserId(ud), req.get("topic"), req.get("level")));
    }

    @DeleteMapping("/exercise/history")
    public ResponseEntity<Map<String, String>> deleteExerciseHistory(
            @AuthenticationPrincipal UserDetails ud) {
        chatService.deleteExerciseHistory(getUserId(ud));
        return ResponseEntity.ok(Map.of("message", "Historique des exercices supprimé"));
    }

    @GetMapping("/exercise/history")
    public ResponseEntity<List<Map<String, Object>>> getExerciseHistory(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(chatService.getExerciseHistory(getUserId(ud)));
    }

    @GetMapping("/exercise/history/{id}")
    public ResponseEntity<?> getExerciseDetail(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id) {
        try {
            return ResponseEntity.ok(chatService.getExerciseDetail(getUserId(ud), id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("detail", e.getMessage()));
        }
    }
}