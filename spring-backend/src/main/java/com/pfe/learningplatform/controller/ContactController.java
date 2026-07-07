package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.ContactRequest;
import com.pfe.learningplatform.dto.ContactResponse;
import com.pfe.learningplatform.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;


    @PostMapping("/api/contact")
    public ResponseEntity<?> submit(@RequestBody ContactRequest request) {
        try {
            ContactResponse response = contactService.submit(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Erreur interne. Veuillez réessayer."));
        }
    }
}