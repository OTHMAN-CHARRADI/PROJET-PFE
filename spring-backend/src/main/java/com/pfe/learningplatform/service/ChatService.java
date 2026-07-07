package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.ChatRequest;
import com.pfe.learningplatform.dto.ChatResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;

import org.springframework.http.*;

import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ChatService {



    private final RestTemplate restTemplate;



    @Value("${python.ai.url}")
    private String pythonAiUrl;



    public ChatResponse sendMessage(

            ChatRequest request
    ) {



        String url =
                pythonAiUrl + "/api/chat";



        HttpHeaders headers =
                new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_JSON
        );



        HttpEntity<ChatRequest> entity =
                new HttpEntity<>(
                        request,
                        headers
                );



        ResponseEntity<ChatResponse> response =

                restTemplate.exchange(

                        url,

                        HttpMethod.POST,

                        entity,

                        ChatResponse.class
                );



        return response.getBody();
    }
}