package com.pfe.learningplatform.service;

import com.pfe.learningplatform.model.Question;
import com.pfe.learningplatform.model.Quiz;
import com.pfe.learningplatform.model.Section;

import com.pfe.learningplatform.repository.QuestionRepository;
import com.pfe.learningplatform.repository.QuizRepository;
import com.pfe.learningplatform.repository.SectionRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.http.*;

import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class IAService {

        private final RestTemplate restTemplate;

        private final SectionRepository sectionRepository;

        private final QuizRepository quizRepository;

        private final QuestionRepository questionRepository;

        @Value("${python.ai.url}")
        private String pythonAiUrl;

        public Quiz generateQuiz(Long sectionId, String difficulty) {

                Section section = sectionRepository.findById(sectionId)
                                .orElseThrow(() -> new RuntimeException("Section non trouvée"));

                Map<String, Object> requestBody = Map.of(
                                "course", section.getCourse().getTitle(),
                                "section", section.getTitle(),
                                "difficulty", difficulty,
                                "numberOfQuestions", 5);


                String url = pythonAiUrl + "/api/generate-quiz";

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<Map> response = restTemplate.exchange(
                                url, HttpMethod.POST, entity, Map.class);

                Map<String, Object> aiResponse = response.getBody();

                Quiz quiz = new Quiz();
                quiz.setDifficulty(difficulty);
                quiz.setCreatedAt(LocalDateTime.now());
                quiz.setSection(section);
                quiz = quizRepository.save(quiz);

                List<Map<String, Object>> questionsData = (List<Map<String, Object>>) aiResponse.get("questions");

                List<Question> savedQuestions = new ArrayList<>();

                for (Map<String, Object> q : questionsData) {
                        Question question = new Question();
                        question.setQuestion((String) q.get("question"));

                        List<String> options = (List<String>) q.get("options");
                        question.setOptionA(options.get(0));
                        question.setOptionB(options.get(1));
                        question.setOptionC(options.get(2));
                        question.setOptionD(options.get(3));
                        question.setCorrectAnswer((String) q.get("correct_answer"));
                        question.setQuiz(quiz);

                        savedQuestions.add(questionRepository.save(question));
                }

                quiz.setQuestions(savedQuestions);
                return quiz;
        }
}