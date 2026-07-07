package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.SectionRequest;
import com.pfe.learningplatform.dto.SectionResponse;
import com.pfe.learningplatform.model.Course;
import com.pfe.learningplatform.model.Section;
import com.pfe.learningplatform.model.Video;
import com.pfe.learningplatform.repository.CourseRepository;
import com.pfe.learningplatform.repository.SectionRepository;
import com.pfe.learningplatform.repository.VideoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SectionService {

        private final SectionRepository sectionRepository;
        private final CourseRepository courseRepository;
        private final VideoRepository videoRepository;

        public SectionService(SectionRepository sectionRepository,
                        CourseRepository courseRepository,
                        VideoRepository videoRepository) {
                this.sectionRepository = sectionRepository;
                this.courseRepository = courseRepository;
                this.videoRepository = videoRepository;
        }


        public SectionResponse createSection(SectionRequest request) {
                Course course = courseRepository.findById(request.getCourseId())
                                .orElseThrow(() -> new RuntimeException("Cours non trouvé"));

                Section section = Section.builder()
                                .title(request.getTitle())
                                .content(request.getContent())
                                .videoUrl(request.getVideoUrl())
                                .summary(request.getSummary())
                                .course(course)
                                .build();

                Section saved = sectionRepository.save(section);


                if (hasVideoUrl(request.getVideoUrl())) {
                        syncVideo(saved, course.getId(), request.getVideoUrl());
                }

                return toDTO(saved);
        }


        public List<SectionResponse> getAllSections() {
                return sectionRepository.findAll()
                                .stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }


        public SectionResponse getSectionById(Long id) {
                Section section = sectionRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Section non trouvée"));
                return toDTO(section);
        }


        public List<SectionResponse> getSectionsByCourse(Long courseId) {
                return sectionRepository.findByCourse_Id(courseId)
                                .stream()
                                .map(this::toDTO)
                                .collect(Collectors.toList());
        }


        public SectionResponse updateSection(Long id, SectionRequest request) {
                Section section = sectionRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Section non trouvée"));

                if (request.getTitle() != null)
                        section.setTitle(request.getTitle());
                if (request.getContent() != null)
                        section.setContent(request.getContent());
                if (request.getSummary() != null)
                        section.setSummary(request.getSummary());

                if (request.getCourseId() != null) {
                        Course course = courseRepository.findById(request.getCourseId())
                                        .orElseThrow(() -> new RuntimeException("Cours non trouvé"));
                        section.setCourse(course);
                }


                if (request.getVideoUrl() != null) {
                        section.setVideoUrl(request.getVideoUrl());
                        Section saved = sectionRepository.save(section);
                        if (hasVideoUrl(request.getVideoUrl())) {
                                syncVideo(saved, saved.getCourse().getId(), request.getVideoUrl());
                        } else {

                                videoRepository.findBySectionId(saved.getId())
                                                .forEach(v -> videoRepository.delete(v));
                        }
                        return toDTO(saved);
                }

                return toDTO(sectionRepository.save(section));
        }


        public void deleteSection(Long id) {
                if (!sectionRepository.existsById(id)) {
                        throw new RuntimeException("Section non trouvée");
                }

                videoRepository.findBySectionId(id)
                                .forEach(v -> videoRepository.delete(v));
                sectionRepository.deleteById(id);
        }




        private boolean hasVideoUrl(String url) {
                return url != null && !url.trim().isEmpty();
        }


        private void syncVideo(Section section, Long courseId, String videoUrl) {
                List<Video> existing = videoRepository.findBySectionId(section.getId());
                Video video;
                if (!existing.isEmpty()) {
                        video = existing.get(0);
                } else {
                        video = new Video();
                }
                video.setTitle(section.getTitle());
                video.setDescription(section.getSummary() != null ? section.getSummary() : section.getContent());
                video.setYoutubeUrl(videoUrl);
                video.setCourseId(courseId);
                video.setSectionId(section.getId());
                videoRepository.save(video);
        }

        private SectionResponse toDTO(Section section) {
                return SectionResponse.builder()
                                .id(section.getId())
                                .title(section.getTitle())
                                .content(section.getContent())
                                .videoUrl(section.getVideoUrl())
                                .summary(section.getSummary())
                                .courseId(section.getCourse().getId())
                                .courseTitle(section.getCourse().getTitle())
                                .build();
        }
}