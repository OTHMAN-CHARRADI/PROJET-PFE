package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.dto.VideoRequest;
import com.pfe.learningplatform.dto.VideoResponse;
import com.pfe.learningplatform.service.VideoService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/videos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class VideoUploadController {

    private final VideoService videoService;

    @Value("${upload.dir:uploads/videos}")
    private String uploadDir;

    
    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "courseId", required = false) Long courseId,
            @RequestParam(value = "sectionId", required = false) Long sectionId) {

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("detail", "Seuls les fichiers vidéo sont acceptés."));
        }

        try {

            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);


            String originalName = file.getOriginalFilename();
            String ext = (originalName != null && originalName.contains("."))
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : ".mp4";
            String fileName = UUID.randomUUID().toString() + ext;
            Path filePath = uploadPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);


            String videoUrl = "/uploads/videos/" + fileName;


            String videoTitle = (title != null && !title.isBlank())
                    ? title
                    : (originalName != null ? originalName.replaceAll("\\.[^.]+$", "") : "Vidéo");

            VideoRequest request = VideoRequest.builder()
                    .title(videoTitle)
                    .description(description)
                    .youtubeUrl(videoUrl)
                    .courseId(courseId)
                    .sectionId(sectionId)
                    .build();

            VideoResponse response = videoService.createVideo(request);
            return ResponseEntity.status(201).body(response);

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("detail", "Erreur lors de l'upload : " + e.getMessage()));
        }
    }

    
    @PostMapping("/upload-thumbnail")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadThumbnail(@RequestParam("file") MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("detail", "Seuls les fichiers image sont acceptés."));
        }

        try {
            Path thumbnailPath = Paths.get("uploads/thumbnails");
            Files.createDirectories(thumbnailPath);

            String originalName = file.getOriginalFilename();
            String ext = (originalName != null && originalName.contains("."))
                    ? originalName.substring(originalName.lastIndexOf('.'))
                    : ".jpg";
            String fileName = UUID.randomUUID().toString() + ext;
            Path filePath = thumbnailPath.resolve(fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String thumbnailUrl = "/uploads/thumbnails/" + fileName;
            return ResponseEntity.ok(Map.of("url", thumbnailUrl));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("detail", "Erreur lors de l'upload de la miniature : " + e.getMessage()));
        }
    }
}