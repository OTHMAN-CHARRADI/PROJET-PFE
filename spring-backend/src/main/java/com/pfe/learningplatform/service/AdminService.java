package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.AdminStatsResponse;
import com.pfe.learningplatform.dto.AdminUserDetailResponse;
import com.pfe.learningplatform.dto.AdminUserResponse;
import com.pfe.learningplatform.model.ChatConversation;
import com.pfe.learningplatform.repository.ChatConversationRepository;
import com.pfe.learningplatform.repository.ProgressRecordRepository;
import com.pfe.learningplatform.model.Role;
import com.pfe.learningplatform.model.User;
import com.pfe.learningplatform.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final VideoRepository videoRepository;
    private final QuizRecordRepository quizRecordRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ExerciseRecordRepository exerciseRecordRepository;
    private final ProgressRecordRepository progressRecordRepository;
    private final ChatConversationRepository chatConversationRepository;

    public AdminService(UserRepository userRepository,
            CourseRepository courseRepository,
            SectionRepository sectionRepository,
            VideoRepository videoRepository,
            QuizRecordRepository quizRecordRepository,
            ChatMessageRepository chatMessageRepository,
            ExerciseRecordRepository exerciseRecordRepository,
            ProgressRecordRepository progressRecordRepository,
            ChatConversationRepository chatConversationRepository) {
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.sectionRepository = sectionRepository;
        this.videoRepository = videoRepository;
        this.quizRecordRepository = quizRecordRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.exerciseRecordRepository = exerciseRecordRepository;
        this.progressRecordRepository = progressRecordRepository;
        this.chatConversationRepository = chatConversationRepository;
    }



    public AdminStatsResponse getStats() {
        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalCourses(courseRepository.count())
                .totalSections(sectionRepository.count())
                .totalVideos(videoRepository.count())
                .totalQuizzes(quizRecordRepository.count())
                .totalMessages(chatMessageRepository.count())
                .totalExercises(exerciseRecordRepository.count())
                .build();
    }



    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toAdminUserResponse)
                .collect(Collectors.toList());
    }



    public AdminUserResponse updateUserRole(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        try {
            Role role = Role.valueOf(roleName.toUpperCase());
            user.setRole(role);
            userRepository.save(user);
            return toAdminUserResponse(user);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rôle invalide : " + roleName);
        }
    }



    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        userRepository.delete(user);
    }



    public AdminUserDetailResponse getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        var quizzes = quizRecordRepository.findByUserIdOrderByTakenAtDesc(userId);
        var exercises = exerciseRecordRepository.findByUserIdOrderByCreatedAtDesc(userId);
        var progressList = progressRecordRepository.findByUserId(userId);
        var conversations = chatConversationRepository.findByUserId(userId);

        var recentQuizzes = quizzes.stream().limit(10).map(q -> AdminUserDetailResponse.QuizSummary.builder()
                .topic(q.getTopic()).level(q.getLevel())
                .score(q.getScore()).totalQuestions(q.getTotalQuestions())
                .takenAt(q.getTakenAt()).build()).toList();

        var recentExercises = exercises.stream().limit(10).map(e -> AdminUserDetailResponse.ExerciseSummary.builder()
                .id(e.getId()).topic(e.getTopic()).level(e.getLevel())
                .createdAt(e.getCreatedAt()).build()).toList();

        var progress = progressList.stream().map(p -> AdminUserDetailResponse.ProgressSummary.builder()
                .topic(p.getTopic()).masteryScore(p.getMasteryScore())
                .lastUpdated(p.getLastUpdated()).build()).toList();

        var recentChats = conversations.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10).map(c -> AdminUserDetailResponse.ChatSummary.builder()
                        .id(c.getId()).title(c.getTitle())
                        .createdAt(c.getCreatedAt()).build())
                .toList();

        return AdminUserDetailResponse.builder()
                .id(user.getId()).username(user.getUsername()).email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .level(user.getLevel()).profilePicture(user.getProfilePicture())
                .createdAt(user.getCreatedAt())
                .totalQuizzes(quizzes.size()).totalExercises(exercises.size())
                .totalChats(conversations.size()).totalProgressTopics(progressList.size())
                .recentQuizzes(recentQuizzes).recentExercises(recentExercises)
                .progress(progress).recentChats(recentChats)
                .build();
    }



    private AdminUserResponse toAdminUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().name() : "USER")
                .level(user.getLevel() != null ? user.getLevel() : "débutant")
                .profilePicture(user.getProfilePicture())
                .createdAt(user.getCreatedAt())
                .build();
    }
}