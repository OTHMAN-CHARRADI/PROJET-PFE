package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.UnifiedMessageResponse;
import com.pfe.learningplatform.dto.UnifiedReplyRequest;
import com.pfe.learningplatform.service.UnifiedMessagingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/admin/messages")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class UnifiedMessagingController {

    private final UnifiedMessagingService messagingService;





    @GetMapping
    public ResponseEntity<?> getAllMessages(
            @RequestParam(defaultValue = "50") int gmailMax) {
        try {
            List<UnifiedMessageResponse> messages = messagingService.fetchAll(gmailMax);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", e.getMessage()));
        }
    }





    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @RequestParam(defaultValue = "50") int gmailMax) {
        try {

            messagingService.triggerBackgroundRefresh();

            List<UnifiedMessageResponse> messages = messagingService.fetchAll(gmailMax);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", e.getMessage()));
        }
    }






    @PostMapping("/reply")
    public ResponseEntity<?> reply(@RequestBody UnifiedReplyRequest request) {
        try {
            messagingService.reply(request);
            return ResponseEntity.ok(Map.of("message", "Réponse envoyée avec succès."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Erreur interne : " + e.getMessage()));
        }
    }





    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(messagingService.markContactRead(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }





    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(
            @PathVariable String id,
            @RequestParam(defaultValue = "CONTACT_FORM") String source) {
        try {
            if ("GMAIL_INBOX".equalsIgnoreCase(source)) {
                messagingService.deleteGmailMessage(Integer.parseInt(id));
            } else {
                messagingService.deleteContact(Long.parseLong(id));
            }
            return ResponseEntity.ok(Map.of("message", "Message supprimé avec succès."));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "ID invalide : " + id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }
}