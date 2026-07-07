package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.ProgressResponse;
import com.pfe.learningplatform.dto.QuizSubmissionRequest;
import com.pfe.learningplatform.model.Question;
import com.pfe.learningplatform.model.Quiz;
import com.pfe.learningplatform.model.StudentProgress;
import com.pfe.learningplatform.model.User;
import com.pfe.learningplatform.repository.QuestionRepository;
import com.pfe.learningplatform.repository.QuizRepository;
import com.pfe.learningplatform.repository.StudentProgressRepository;
import com.pfe.learningplatform.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final QuizRepository quizRepository;

    private final QuestionRepository questionRepository;

    private final UserRepository userRepository;

    private final StudentProgressRepository
            studentProgressRepository;



    public ProgressResponse submitQuiz(

            QuizSubmissionRequest request
    ) {

        Quiz quiz =
                quizRepository.findById(
                        request.getQuizId()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Quiz not found"
                        )
                );

        User student =
                userRepository.findById(
                        request.getStudentId()
                ).orElseThrow(
                        () -> new RuntimeException(
                                "Student not found"
                        )
                );

        List<Question> questions =
                questionRepository.findByQuiz(quiz);

        int correctAnswers = 0;

        Map<Long, String> studentAnswers =
                request.getAnswers();



        for (Question question : questions) {

            String selectedAnswer =
                    studentAnswers.get(
                            question.getId()
                    );

            if (selectedAnswer != null &&
                    selectedAnswer.equalsIgnoreCase(
                            question.getCorrectAnswer()
                    )) {

                correctAnswers++;
            }
        }



        double score =
                ((double) correctAnswers
                        / questions.size()) * 100;



        StudentProgress progress =
                studentProgressRepository
                        .findByStudentAndSection(
                                student,
                                quiz.getSection()
                        )
                        .orElseGet(() -> {

                            StudentProgress newProgress =
                                    new StudentProgress();

                            newProgress.setStudent(student);

                            newProgress.setSection(
                                    quiz.getSection()
                            );

                            newProgress.setCurrentLevel(1);

                            newProgress
                                    .setCompletedQuizzes(0);

                            newProgress
                                    .setAverageScore(0);

                            return newProgress;
                        });



        String message = "Keep Learning";

        if (score >= 70) {

            progress.setCompletedQuizzes(
                    progress.getCompletedQuizzes() + 1
            );



            if (progress.getCompletedQuizzes() >= 8) {

                progress.setCurrentLevel(
                        progress.getCurrentLevel() + 1
                );

                progress.setCompletedQuizzes(0);

                message = "Level Up !";
            }
        }

        progress.setAverageScore(score);

        studentProgressRepository.save(progress);



        return new ProgressResponse(

                quiz.getSection()
                        .getCourse()
                        .getTitle(),

                quiz.getSection()
                        .getTitle(),

                progress.getCurrentLevel(),

                progress.getCompletedQuizzes(),

                progress.getAverageScore(),

                message
        );
    }



    public List<ProgressResponse>
    getStudentProgress(Long studentId) {

        User student =
                userRepository.findById(studentId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Student not found"
                                )
                        );

        List<StudentProgress> progressList =
                studentProgressRepository
                        .findByStudent(student);

        List<ProgressResponse> responses =
                new ArrayList<>();

        for (StudentProgress progress : progressList) {

            responses.add(

                    new ProgressResponse(

                            progress.getSection()
                                    .getCourse()
                                    .getTitle(),

                            progress.getSection()
                                    .getTitle(),

                            progress.getCurrentLevel(),

                            progress.getCompletedQuizzes(),

                            progress.getAverageScore(),

                            "Progress Loaded"
                    )
            );
        }

        return responses;
    }
}