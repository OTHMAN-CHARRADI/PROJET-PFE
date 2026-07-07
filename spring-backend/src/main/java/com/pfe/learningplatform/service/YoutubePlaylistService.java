package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.PlaylistImportRequest;
import com.pfe.learningplatform.dto.PlaylistImportResponse;
import com.pfe.learningplatform.model.Course;
import com.pfe.learningplatform.model.Section;
import com.pfe.learningplatform.model.Video;
import com.pfe.learningplatform.repository.CourseRepository;
import com.pfe.learningplatform.repository.SectionRepository;
import com.pfe.learningplatform.repository.VideoRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class YoutubePlaylistService {

    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final VideoRepository videoRepository;
    private final RestTemplate restTemplate;

    public YoutubePlaylistService(CourseRepository courseRepository,
            SectionRepository sectionRepository,
            VideoRepository videoRepository,
            RestTemplate restTemplate) {
        this.courseRepository = courseRepository;
        this.sectionRepository = sectionRepository;
        this.videoRepository = videoRepository;
        this.restTemplate = restTemplate;
    }

    
    private String extractPlaylistId(String input) {
        if (input == null || input.isBlank()) {
            throw new RuntimeException("URL de playlist manquante");
        }

        Pattern pattern = Pattern.compile("[?&]list=([a-zA-Z0-9_-]+)");
        Matcher matcher = pattern.matcher(input);
        if (matcher.find()) {
            return matcher.group(1);
        }

        if (input.matches("[a-zA-Z0-9_-]+")) {
            return input;
        }
        throw new RuntimeException("Impossible d'extraire l'ID de playlist depuis : " + input);
    }

    
    @SuppressWarnings("unchecked")
    public PlaylistImportResponse importPlaylist(PlaylistImportRequest request) {

        String playlistId = extractPlaylistId(request.getPlaylistUrl());
        String apiKey = request.getApiKey();

        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("Clé API YouTube requise");
        }


        String playlistUrl = String.format(
                "https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=%s&key=%s",
                playlistId, apiKey);

        Map<String, Object> playlistResponse = restTemplate.getForObject(playlistUrl, Map.class);
        List<Map<String, Object>> playlistItems = (List<Map<String, Object>>) playlistResponse.get("items");

        if (playlistItems == null || playlistItems.isEmpty()) {
            throw new RuntimeException("Playlist introuvable ou inaccessible avec cette clé API");
        }

        Map<String, Object> playlistSnippet = (Map<String, Object>) playlistItems.get(0).get("snippet");
        String playlistTitle = (String) playlistSnippet.get("title");
        String playlistDescription = (String) playlistSnippet.getOrDefault("description", "");


        Course course = Course.builder()
                .title(playlistTitle)
                .description(playlistDescription.length() > 250
                        ? playlistDescription.substring(0, 250)
                        : playlistDescription)
                .build();
        course = courseRepository.save(course);


        List<Map<String, Object>> allVideoItems = new ArrayList<>();
        String nextPageToken = null;

        do {
            String videosUrl = String.format(
                    "https://www.googleapis.com/youtube/v3/playlistItems" +
                            "?part=snippet&maxResults=50&playlistId=%s&key=%s%s",
                    playlistId, apiKey,
                    nextPageToken != null ? "&pageToken=" + nextPageToken : "");

            Map<String, Object> videosResponse = restTemplate.getForObject(videosUrl, Map.class);
            List<Map<String, Object>> pageItems = (List<Map<String, Object>>) videosResponse.get("items");

            if (pageItems != null) {
                allVideoItems.addAll(pageItems);
            }

            nextPageToken = (String) videosResponse.get("nextPageToken");

        } while (nextPageToken != null);


        List<String> sectionTitles = new ArrayList<>();

        for (Map<String, Object> item : allVideoItems) {
            Map<String, Object> snippet = (Map<String, Object>) item.get("snippet");


            if (snippet == null)
                continue;
            Map<String, Object> resourceId = (Map<String, Object>) snippet.get("resourceId");
            if (resourceId == null)
                continue;
            String videoId = (String) resourceId.get("videoId");
            if (videoId == null || videoId.equals("deleted") || videoId.equals("private"))
                continue;

            String videoTitle = (String) snippet.getOrDefault("title", "Sans titre");
            String videoDescription = (String) snippet.getOrDefault("description", "");
            String youtubeUrl = "https://www.youtube.com/watch?v=" + videoId;


            String thumbnailUrl = null;
            Map<String, Object> thumbnails = (Map<String, Object>) snippet.get("thumbnails");
            if (thumbnails != null) {
                Map<String, Object> hq = (Map<String, Object>) thumbnails.get("high");
                if (hq != null)
                    thumbnailUrl = (String) hq.get("url");
                if (thumbnailUrl == null) {
                    Map<String, Object> med = (Map<String, Object>) thumbnails.get("medium");
                    if (med != null)
                        thumbnailUrl = (String) med.get("url");
                }
            }


            Section section = Section.builder()
                    .title(videoTitle)
                    .content(videoDescription.length() > 5000
                            ? videoDescription.substring(0, 5000)
                            : videoDescription)
                    .videoUrl(youtubeUrl)
                    .summary("")
                    .course(course)
                    .build();
            section = sectionRepository.save(section);


            Video video = new Video();
            video.setTitle(videoTitle);
            video.setDescription(videoDescription.length() > 1000
                    ? videoDescription.substring(0, 1000)
                    : videoDescription);
            video.setYoutubeUrl(youtubeUrl);
            video.setThumbnailUrl(thumbnailUrl);
            video.setCourseId(course.getId());
            video.setSectionId(section.getId());
            videoRepository.save(video);

            sectionTitles.add(videoTitle);
        }

        return PlaylistImportResponse.builder()
                .courseId(course.getId())
                .courseTitle(playlistTitle)
                .sectionsCreated(sectionTitles.size())
                .sectionTitles(sectionTitles)
                .build();
    }
}