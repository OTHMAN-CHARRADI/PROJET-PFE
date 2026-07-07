package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.NotificationResponse;
import com.pfe.learningplatform.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;


    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(Authentication auth) {
        return ResponseEntity.ok(notificationService.getForUser(auth.getName()));
    }


    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(notificationService.countUnread(auth.getName()));
    }


    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(Authentication auth) {
        notificationService.markAllRead(auth.getName());
        return ResponseEntity.ok().build();
    }


    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markOneRead(@PathVariable Long id, Authentication auth) {
        notificationService.markOneRead(id, auth.getName());
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOne(@PathVariable Long id, Authentication auth) {
        notificationService.deleteOne(id, auth.getName());
        return ResponseEntity.noContent().build();
    }


    @DeleteMapping
    public ResponseEntity<Void> deleteAll(Authentication auth) {
        notificationService.deleteAll(auth.getName());
        return ResponseEntity.noContent().build();
    }
}
