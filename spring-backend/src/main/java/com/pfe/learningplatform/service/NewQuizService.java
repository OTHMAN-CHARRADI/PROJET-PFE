package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.*;
import com.pfe.learningplatform.model.*;
import com.pfe.learningplatform.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class NewQuizService {

    private final QuizRecordRepository quizRepo;
    private final ProgressRecordRepository progressRepo;
    private final UserRepository userRepo;
    private final RestTemplate restTemplate;

    @Value("${python.ai.url}")
    private String pythonAiUrl;

    public NewQuizService(QuizRecordRepository quizRepo,
            ProgressRecordRepository progressRepo,
            UserRepository userRepo,
            RestTemplate restTemplate) {
        this.quizRepo = quizRepo;
        this.progressRepo = progressRepo;
        this.userRepo = userRepo;
        this.restTemplate = restTemplate;
    }



    public Map<String, Object> generateQuiz(Long userId, QuizGenerateRequest request) {
        Map<String, Object> aiRequest = new HashMap<>();
        aiRequest.put("topic", request.getTopic());
        aiRequest.put("level", request.getLevel());
        aiRequest.put("num_questions", request.getNum_questions());

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(aiRequest, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    pythonAiUrl + "/api/generate-quiz", HttpMethod.POST, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Erreur génération quiz: " + e.getMessage());
        }
    }



    public QuizResultResponse submitQuiz(Long userId, QuizSubmitRequest request) {
        int score = 0;
        int total = request.getAnswers().size();
        List<QuizResultDetail> details = new ArrayList<>();

        QuizRecord quiz = QuizRecord.builder()
                .userId(userId)
                .topic(request.getTopic())
                .level(request.getLevel())
                .totalQuestions(total)
                .score(0)
                .answers(new ArrayList<>())
                .build();
        quiz.prePersist();
        quizRepo.save(quiz);

        for (QuizAnswerDto answer : request.getAnswers()) {
            boolean correct = answer.getUser_answer().trim().equalsIgnoreCase(
                    answer.getCorrect_answer().trim());
            if (correct)
                score++;

            QuizAnswerRecord rec = QuizAnswerRecord.builder()
                    .quiz(quiz)
                    .question(answer.getQuestion())
                    .userAnswer(answer.getUser_answer())
                    .correctAnswer(answer.getCorrect_answer())
                    .isCorrect(correct)
                    .explanation(answer.getExplanation() != null ? answer.getExplanation() : "")
                    .build();
            quiz.getAnswers().add(rec);

            details.add(QuizResultDetail.builder()
                    .question(answer.getQuestion())
                    .user_answer(answer.getUser_answer())
                    .correct_answer(answer.getCorrect_answer())
                    .is_correct(correct)
                    .explanation(answer.getExplanation() != null ? answer.getExplanation() : "")
                    .build());
        }

        quiz.setScore(score);
        quizRepo.save(quiz);


        double pct = total > 0 ? (double) score / total * 100 : 0;
        updateProgress(userId, request.getTopic(), pct);


        updateUserLevel(userId);

        return QuizResultResponse.builder()
                .quiz_id(quiz.getId())
                .topic(request.getTopic())
                .level(request.getLevel())
                .score(score)
                .total_questions(total)
                .percentage(Math.round(pct * 10.0) / 10.0)
                .details(details)
                .build();
    }



    public List<QuizHistoryItem> getHistory(Long userId) {
        return quizRepo.findByUserIdOrderByTakenAtDesc(userId).stream()
                .map(q -> QuizHistoryItem.builder()
                        .id(q.getId())
                        .topic(q.getTopic())
                        .level(q.getLevel())
                        .score(q.getScore())
                        .total_questions(q.getTotalQuestions())
                        .taken_at(q.getTakenAt())
                        .build())
                .collect(Collectors.toList());
    }



    private void updateProgress(Long userId, String topic, double percentage) {
        Optional<ProgressRecord> existing = progressRepo.findByUserIdAndTopic(userId, topic);
        ProgressRecord progress;
        if (existing.isPresent()) {
            progress = existing.get();
            progress.setMasteryScore(Math.round(progress.getMasteryScore() * 0.6 + percentage * 0.4 * 10.0) / 10.0);
        } else {
            progress = ProgressRecord.builder()
                    .userId(userId)
                    .topic(topic)
                    .masteryScore(Math.round(percentage * 10.0) / 10.0)
                    .build();
        }
        progress.update();
        progressRepo.save(progress);
    }

    private void updateUserLevel(Long userId) {
        List<QuizRecord> recent = quizRepo.findByUserIdOrderByTakenAtDesc(userId);
        if (recent.size() < 3)
            return;

        List<Double> scores = recent.stream()
                .limit(5)
                .filter(q -> q.getScore() != null && q.getTotalQuestions() != null && q.getTotalQuestions() > 0)
                .map(q -> (double) q.getScore() / q.getTotalQuestions() * 100)
                .collect(Collectors.toList());

        if (scores.isEmpty())
            return;
        double avg = scores.stream().mapToDouble(Double::doubleValue).average().orElse(0);

        User user = userRepo.findById(userId).orElse(null);
        if (user == null)
            return;

        String newLevel = avg >= 80 ? "avancé" : avg >= 50 ? "intermédiaire" : "débutant";
        user.setLevel(newLevel);
        userRepo.save(user);
    }



    public QuizDetailResponse getQuizDetail(Long userId, Long quizId) {
        QuizRecord quiz = quizRepo.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz non trouvé"));
        if (!quiz.getUserId().equals(userId)) {
            throw new RuntimeException("Accès refusé");
        }
        List<QuizResultDetail> details = quiz.getAnswers().stream()
                .map(a -> QuizResultDetail.builder()
                        .question(a.getQuestion())
                        .user_answer(a.getUserAnswer())
                        .correct_answer(a.getCorrectAnswer())
                        .is_correct(Boolean.TRUE.equals(a.getIsCorrect()))
                        .explanation(a.getExplanation() != null ? a.getExplanation() : "")
                        .build())
                .collect(Collectors.toList());
        return QuizDetailResponse.builder()
                .id(quiz.getId())
                .topic(quiz.getTopic())
                .level(quiz.getLevel())
                .score(quiz.getScore())
                .total_questions(quiz.getTotalQuestions())
                .taken_at(quiz.getTakenAt())
                .details(details)
                .build();
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteHistory(Long userId) {
        quizRepo.deleteByUserId(userId);
    }
}