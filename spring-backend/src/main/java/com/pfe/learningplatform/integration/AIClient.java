package com.pfe.learningplatform.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;


@Component
public class AIClient {

    private final RestTemplate restTemplate;

    @Value("${python.ai.url}")
    private String pythonAiUrl;

    public AIClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String generateQuiz(String topic) {
        String url = pythonAiUrl + "/api/generate-quiz";
        Map<String, String> request = Map.of("topic", topic);
        return restTemplate.postForObject(url, request, String.class);
    }
}