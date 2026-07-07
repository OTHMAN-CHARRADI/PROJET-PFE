package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.PlaylistImportRequest;
import com.pfe.learningplatform.dto.PlaylistImportResponse;
import com.pfe.learningplatform.service.YoutubePlaylistService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/youtube")
@CrossOrigin(origins = "http://localhost:5173")
public class YoutubePlaylistController {

    private final YoutubePlaylistService youtubePlaylistService;

    public YoutubePlaylistController(YoutubePlaylistService youtubePlaylistService) {
        this.youtubePlaylistService = youtubePlaylistService;
    }

    
    @PostMapping("/import-playlist")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> importPlaylist(@RequestBody PlaylistImportRequest request) {
        try {
            PlaylistImportResponse response = youtubePlaylistService.importPlaylist(request);
            return ResponseEntity.status(201).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("detail", e.getMessage()));
        }
    }
}