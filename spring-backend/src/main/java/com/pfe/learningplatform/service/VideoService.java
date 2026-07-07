package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.VideoRequest;
import com.pfe.learningplatform.dto.VideoResponse;
import com.pfe.learningplatform.model.Video;
import com.pfe.learningplatform.repository.VideoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoService {

        private final VideoRepository videoRepository;


        public VideoResponse createVideo(VideoRequest request) {
                Video video = Video.builder()
                                .title(request.getTitle())
                                .description(request.getDescription())
                                .youtubeUrl(request.getYoutubeUrl())
                                .thumbnailUrl(request.getThumbnailUrl())
                                .courseId(request.getCourseId())
                                .sectionId(request.getSectionId())
                                .build();
                return toDTO(videoRepository.save(video));
        }


        public List<VideoResponse> getAllVideos() {
                return videoRepository.findAll().stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }


        public VideoResponse getVideoById(Long id) {
                Video video = videoRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Vidéo non trouvée"));
                return toDTO(video);
        }


        public List<VideoResponse> getVideosByCourse(Long courseId) {
                return videoRepository.findByCourseId(courseId).stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }


        public List<VideoResponse> getVideosBySection(Long sectionId) {
                return videoRepository.findBySectionId(sectionId).stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }


        public void deleteVideo(Long id) {
                if (!videoRepository.existsById(id)) {
                        throw new RuntimeException("Vidéo non trouvée");
                }
                videoRepository.deleteById(id);
        }


        private VideoResponse toDTO(Video video) {
                return VideoResponse.builder()
                                .id(video.getId())
                                .title(video.getTitle())
                                .description(video.getDescription())
                                .youtubeUrl(video.getYoutubeUrl())
                                .thumbnailUrl(video.getThumbnailUrl())
                                .courseId(video.getCourseId())
                                .sectionId(video.getSectionId())
                                .build();
        }
}