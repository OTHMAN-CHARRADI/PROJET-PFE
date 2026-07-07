package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.*;
import com.pfe.learningplatform.model.*;
import com.pfe.learningplatform.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class NewProgressService {

        private final ProgressRecordRepository progressRepo;
        private final QuizRecordRepository quizRepo;
        private final UserRepository userRepo;
        private final ChatConversationRepository convRepo;
        private final SectionCompletionRepository sectionCompletionRepo;
        private final SectionRepository sectionRepo;
        private final CourseRepository courseRepo;

        public NewProgressService(ProgressRecordRepository progressRepo,
                        QuizRecordRepository quizRepo,
                        UserRepository userRepo,
                        ChatConversationRepository convRepo,
                        SectionCompletionRepository sectionCompletionRepo,
                        SectionRepository sectionRepo,
                        CourseRepository courseRepo) {
                this.progressRepo = progressRepo;
                this.quizRepo = quizRepo;
                this.userRepo = userRepo;
                this.convRepo = convRepo;
                this.sectionCompletionRepo = sectionCompletionRepo;
                this.sectionRepo = sectionRepo;
                this.courseRepo = courseRepo;
        }




        @Transactional
        public void markSectionCompleted(Long userId, Long sectionId) {
                if (sectionCompletionRepo.existsByUserIdAndSectionId(userId, sectionId)) {
                        return;
                }
                Section section = sectionRepo.findById(sectionId)
                                .orElseThrow(() -> new RuntimeException("Section non trouvée"));

                SectionCompletion completion = SectionCompletion.builder()
                                .userId(userId)
                                .section(section)
                                .build();
                sectionCompletionRepo.save(completion);
        }




        public ProgressDataResponse getProgress(Long userId) {
                User user = userRepo.findById(userId)
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                List<TopicProgressItem> topics = progressRepo.findByUserId(userId).stream()
                                .map(p -> TopicProgressItem.builder()
                                                .topic(p.getTopic())
                                                .mastery_score(p.getMasteryScore())
                                                .last_updated(p.getLastUpdated())
                                                .build())
                                .collect(Collectors.toList());

                List<QuizHistoryItem> quizHistory = quizRepo.findByUserIdOrderByTakenAtDesc(userId).stream()
                                .map(q -> QuizHistoryItem.builder()
                                                .id(q.getId())
                                                .topic(q.getTopic())
                                                .level(q.getLevel())
                                                .score(q.getScore())
                                                .total_questions(q.getTotalQuestions())
                                                .taken_at(q.getTakenAt())
                                                .build())
                                .collect(Collectors.toList());


                List<SectionCompletion> allCompletions = sectionCompletionRepo.findByUserId(userId);

                Map<Long, Long> completedPerCourse = allCompletions.stream()
                                .collect(Collectors.groupingBy(
                                                sc -> sc.getSection().getCourse().getId(),
                                                Collectors.counting()));

                List<CourseProgressItem> courseProgressList = new ArrayList<>();
                for (Map.Entry<Long, Long> entry : completedPerCourse.entrySet()) {
                        Long courseId = entry.getKey();
                        long completedCount = entry.getValue();
                        courseRepo.findById(courseId).ifPresent(course -> {
                                int totalSections = sectionRepo.findByCourse_Id(courseId).size();
                                double pct = totalSections > 0 ? (completedCount * 100.0 / totalSections) : 0;
                                courseProgressList.add(CourseProgressItem.builder()
                                                .courseId(courseId)
                                                .courseTitle(course.getTitle())
                                                .totalSections(totalSections)
                                                .completedSections((int) completedCount)
                                                .progressPercent(Math.round(pct * 10.0) / 10.0)
                                                .build());
                        });
                }

                return ProgressDataResponse.builder()
                                .user_level(user.getLevel() != null ? user.getLevel() : "débutant")
                                .topics(topics)
                                .quiz_history(quizHistory)
                                .course_progress(courseProgressList)
                                .build();
        }




        public StatsResponse getStats(Long userId) {
                List<QuizRecord> quizzes = quizRepo.findByUserIdOrderByTakenAtDesc(userId);
                List<ProgressRecord> progs = progressRepo.findByUserId(userId);

                List<Double> scores = quizzes.stream()
                                .filter(q -> q.getScore() != null && q.getTotalQuestions() != null
                                                && q.getTotalQuestions() > 0)
                                .map(q -> (double) q.getScore() / q.getTotalQuestions() * 100)
                                .collect(Collectors.toList());

                double avg = scores.isEmpty() ? 0
                                : Math.round(scores.stream().mapToDouble(Double::doubleValue).average().orElse(0)
                                                * 10.0) / 10.0;
                int mastered = (int) progs.stream().filter(p -> p.getMasteryScore() >= 70).count();

                String recommended = "débutant";
                if (scores.size() >= 3) {
                        List<Double> recent = scores.subList(Math.max(0, scores.size() - 5), scores.size());
                        double recAvg = recent.stream().mapToDouble(Double::doubleValue).average().orElse(0);
                        recommended = recAvg >= 80 ? "avancé" : recAvg >= 50 ? "intermédiaire" : "débutant";
                }

                long totalMessages = convRepo.findByUserId(userId).stream()
                                .flatMap(c -> c.getMessages().stream())
                                .filter(m -> "user".equals(m.getRole()))
                                .count();

                int sectionsCompleted = sectionCompletionRepo.findByUserId(userId).size();

                return StatsResponse.builder()
                                .total_quizzes(quizzes.size())
                                .average_score(avg)
                                .topics_mastered(mastered)
                                .recommended_level(recommended)
                                .total_messages((int) totalMessages)
                                .sections_completed(sectionsCompleted)
                                .build();
        }




        public void resetLevel(Long userId) {
                User user = userRepo.findById(userId)
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                quizRepo.deleteAll(quizRepo.findByUserIdOrderByTakenAtDesc(userId));
                progressRepo.deleteAll(progressRepo.findByUserId(userId));
                sectionCompletionRepo.deleteAll(sectionCompletionRepo.findByUserId(userId));
                user.setLevel("débutant");
                userRepo.save(user);
        }
}