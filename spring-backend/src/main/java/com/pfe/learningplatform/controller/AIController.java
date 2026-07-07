package com.pfe.learningplatform.controller;

import com.pfe.learningplatform.model.Quiz;
import com.pfe.learningplatform.service.IAService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AIController {

    private final IAService iaService;



    @GetMapping("/quiz/section/{sectionId}/level/{level}")
    public ResponseEntity<Quiz> generateQuiz(

            @PathVariable Long sectionId,

            @PathVariable String difficulty
    ) {

        Quiz generatedQuiz =
                iaService.generateQuiz(
                        sectionId,
                        difficulty
                );

        return ResponseEntity.ok(generatedQuiz);
    }
}