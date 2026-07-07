package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.*;
import com.pfe.learningplatform.model.*;
import com.pfe.learningplatform.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NewChatService {

        private final ChatConversationRepository conversationRepo;
        private final UserRepository userRepo;
        private final ExerciseRecordRepository exerciseRepo;
        private final RestTemplate restTemplate;

        @Value("${python.ai.url}")
        private String pythonAiUrl;

        private static final String CHAT_FILES_DIR = "uploads/chat_files/";

        public NewChatService(ChatConversationRepository conversationRepo,
                        UserRepository userRepo,
                        ExerciseRecordRepository exerciseRepo,
                        RestTemplate restTemplate) {
                this.conversationRepo = conversationRepo;
                this.userRepo = userRepo;
                this.exerciseRepo = exerciseRepo;
                this.restTemplate = restTemplate;
                try {
                        Files.createDirectories(Paths.get(CHAT_FILES_DIR));
                } catch (IOException ignored) {
                }
        }



        public List<ConversationResponse> listConversations(Long userId) {
                return conversationRepo.findByUserId(userId).stream()
                                .sorted(Comparator.comparing(
                                                ChatConversation::getUpdatedAt,
                                                Comparator.nullsLast(Comparator.reverseOrder())))
                                .map(this::toConversationResponse)
                                .collect(Collectors.toList());
        }

        public ConversationResponse createConversation(Long userId, String title) {
                ChatConversation conv = ChatConversation.builder()
                                .userId(userId)
                                .title(title != null ? title : "Nouvelle conversation")
                                .messages(new ArrayList<>())
                                .build();
                conv.prePersist();
                conversationRepo.save(conv);
                return toConversationResponse(conv);
        }

        public ConversationResponse renameConversation(Long convId, Long userId, String newTitle) {
                ChatConversation conv = conversationRepo.findById(convId)
                                .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));
                if (!conv.getUserId().equals(userId))
                        throw new RuntimeException("Non autorisé");
                conv.setTitle(newTitle);
                conversationRepo.save(conv);
                return toConversationResponse(conv);
        }

        public void deleteConversation(Long convId, Long userId) {
                ChatConversation conv = conversationRepo.findById(convId)
                                .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));
                if (!conv.getUserId().equals(userId))
                        throw new RuntimeException("Non autorisé");
                conversationRepo.delete(conv);
        }

        public List<ChatMessageResponse> getConversationMessages(Long convId, Long userId) {
                ChatConversation conv = conversationRepo.findById(convId)
                                .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));
                if (!conv.getUserId().equals(userId))
                        throw new RuntimeException("Non autorisé");
                return conv.getMessages().stream()
                                .sorted(Comparator.comparing(ChatMessage::getCreatedAt))
                                .map(m -> ChatMessageResponse.builder()
                                                .role(m.getRole())
                                                .content(m.getContent())
                                                .createdAt(m.getCreatedAt())
                                                .conversationId(convId)
                                                .build())
                                .collect(Collectors.toList());
        }



        public Map<String, Object> uploadFile(MultipartFile file) throws IOException {
                String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
                String ext = original.contains(".")
                                ? original.substring(original.lastIndexOf(".")).toLowerCase()
                                : "";
                String filename = UUID.randomUUID().toString().replace("-", "") + ext;
                Files.write(Paths.get(CHAT_FILES_DIR + filename), file.getBytes());

                String type = ext.matches("\\.(png|jpg|jpeg|gif|webp|svg|bmp)") ? "image"
                                : ext.equals(".pdf") ? "pdf" : "text";

                Map<String, Object> result = new HashMap<>();
                result.put("filename", filename);
                result.put("original_name", original);
                result.put("url", "/uploads/chat_files/" + filename);
                result.put("file_type", type);
                result.put("size", file.getSize());
                return result;
        }



        public ChatMessageResponse sendMessage(Long userId, ChatMessageRequest request) {
                User user = userRepo.findById(userId)
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                Long convId = request.getConversationId();
                ChatConversation conv;

                if (convId != null) {
                        conv = conversationRepo.findById(convId)
                                        .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));
                } else {
                        String title = request.getMessage() != null && !request.getMessage().isBlank()
                                        ? (request.getMessage().length() > 60
                                                        ? request.getMessage().substring(0, 60) + "..."
                                                        : request.getMessage())
                                        : "Fichier partagé";
                        conv = ChatConversation.builder()
                                        .userId(userId)
                                        .title(title)
                                        .messages(new ArrayList<>())
                                        .build();
                        conv.prePersist();
                        conversationRepo.save(conv);
                }


                List<Map<String, String>> history = conv.getMessages().stream()
                                .sorted(Comparator.comparing(ChatMessage::getCreatedAt))
                                .limit(6)
                                .map(m -> Map.of("role", m.getRole(), "content", m.getContent()))
                                .collect(Collectors.toList());


                Map<String, Object> aiRequest = new HashMap<>();
                aiRequest.put("message", request.getMessage() != null ? request.getMessage() : "");
                aiRequest.put("level", user.getLevel() != null ? user.getLevel() : "débutant");
                aiRequest.put("conversation_history", history);

                String aiResponse;
                try {
                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);
                        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(aiRequest, headers);
                        ResponseEntity<Map> response = restTemplate.exchange(
                                        pythonAiUrl + "/api/chat", HttpMethod.POST, entity, Map.class);
                        aiResponse = (String) Objects.requireNonNull(response.getBody()).get("response");
                        if (aiResponse == null)
                                aiResponse = "Désolé, je n'ai pas pu générer de réponse.";
                } catch (Exception e) {
                        aiResponse = "Service IA temporairement indisponible: " + e.getMessage();
                }


                ChatMessage userMsg = ChatMessage.builder()
                                .content(request.getMessage() != null ? request.getMessage() : "")
                                .role("user")
                                .conversation(conv)
                                .build();
                userMsg.prePersist();
                conv.getMessages().add(userMsg);


                ChatMessage botMsg = ChatMessage.builder()
                                .content(aiResponse)
                                .role("assistant")
                                .conversation(conv)
                                .build();
                botMsg.prePersist();
                conv.getMessages().add(botMsg);

                conv.preUpdate();
                conversationRepo.save(conv);

                return ChatMessageResponse.builder()
                                .role("assistant")
                                .content(aiResponse)
                                .createdAt(botMsg.getCreatedAt())
                                .conversationId(conv.getId())
                                .build();
        }



        public List<ChatMessageResponse> getChatHistory(Long userId) {
                return conversationRepo.findByUserId(userId).stream()
                                .flatMap(c -> c.getMessages().stream())
                                .sorted(Comparator.comparing(ChatMessage::getCreatedAt))
                                .map(m -> ChatMessageResponse.builder()
                                                .role(m.getRole())
                                                .content(m.getContent())
                                                .createdAt(m.getCreatedAt())
                                                .build())
                                .collect(Collectors.toList());
        }

        
        public ChatMessageResponse saveStreamedMessages(Long userId, ChatSaveRequest req) {
                ChatConversation conv;

                if (req.getConversationId() != null) {
                        conv = conversationRepo.findById(req.getConversationId())
                                        .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));
                        if (!conv.getUserId().equals(userId))
                                throw new RuntimeException("Accès refusé");
                } else {
                        String userMsg = req.getUserMessage();
                        String title = (userMsg != null && !userMsg.isBlank())
                                        ? (userMsg.length() > 60 ? userMsg.substring(0, 60) + "..." : userMsg)
                                        : "Nouvelle conversation";
                        conv = ChatConversation.builder()
                                        .userId(userId)
                                        .title(title)
                                        .messages(new ArrayList<>())
                                        .build();
                        conv.prePersist();
                        conversationRepo.save(conv);
                }


                if (req.getUserMessage() != null && !req.getUserMessage().isBlank()) {
                        ChatMessage userChatMsg = ChatMessage.builder()
                                        .content(req.getUserMessage())
                                        .role("user")
                                        .conversation(conv)
                                        .build();
                        userChatMsg.prePersist();
                        conv.getMessages().add(userChatMsg);
                }


                ChatMessage botMsg = ChatMessage.builder()
                                .content(req.getAssistantMessage() != null ? req.getAssistantMessage() : "")
                                .role("assistant")
                                .conversation(conv)
                                .build();
                botMsg.prePersist();
                conv.getMessages().add(botMsg);

                conv.preUpdate();
                conversationRepo.save(conv);

                return ChatMessageResponse.builder()
                                .role("assistant")
                                .content(botMsg.getContent())
                                .createdAt(botMsg.getCreatedAt())
                                .conversationId(conv.getId())
                                .build();
        }

        public void deleteHistory(Long userId) {
                List<ChatConversation> convs = conversationRepo.findByUserId(userId);
                conversationRepo.deleteAll(convs);
        }



        public Map<String, String> generateExercise(Long userId, String topic, String level) {
                User user = userRepo.findById(userId)
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                Map<String, Object> aiRequest = new HashMap<>();
                aiRequest.put("topic", topic);
                aiRequest.put("level", level != null ? level : user.getLevel());

                String content;
                try {
                        HttpHeaders headers = new HttpHeaders();
                        headers.setContentType(MediaType.APPLICATION_JSON);
                        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(aiRequest, headers);
                        ResponseEntity<Map> response = restTemplate.exchange(
                                        pythonAiUrl + "/api/generate-exercise", HttpMethod.POST, entity, Map.class);
                        content = (String) Objects.requireNonNull(response.getBody()).get("content");
                } catch (Exception e) {
                        content = "Erreur lors de la génération: " + e.getMessage();
                }

                ExerciseRecord rec = ExerciseRecord.builder()
                                .userId(userId)
                                .topic(topic)
                                .level(level != null ? level : user.getLevel())
                                .content(content)
                                .build();
                rec.prePersist();
                exerciseRepo.save(rec);

                return Map.of("content", content);
        }

        public List<Map<String, Object>> getExerciseHistory(Long userId) {
                return exerciseRepo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                                .map(e -> {
                                        Map<String, Object> m = new HashMap<>();
                                        m.put("id", e.getId());
                                        m.put("topic", e.getTopic());
                                        m.put("level", e.getLevel());
                                        m.put("created_at", e.getCreatedAt());
                                        return m;
                                })
                                .collect(Collectors.toList());
        }

        public Map<String, Object> getExerciseDetail(Long userId, Long exerciseId) {
                ExerciseRecord rec = exerciseRepo.findById(exerciseId)
                                .orElseThrow(() -> new RuntimeException("Exercice non trouvé"));
                if (!rec.getUserId().equals(userId)) {
                        throw new RuntimeException("Accès non autorisé");
                }
                Map<String, Object> m = new HashMap<>();
                m.put("id", rec.getId());
                m.put("topic", rec.getTopic());
                m.put("level", rec.getLevel());
                m.put("content", rec.getContent());
                m.put("created_at", rec.getCreatedAt());
                return m;
        }

        @org.springframework.transaction.annotation.Transactional
        public void deleteExerciseHistory(Long userId) {
                exerciseRepo.deleteByUserId(userId);
        }



        private ConversationResponse toConversationResponse(ChatConversation c) {
                return ConversationResponse.builder()
                                .id(c.getId())
                                .title(c.getTitle())
                                .createdAt(c.getCreatedAt())
                                .updatedAt(c.getUpdatedAt())
                                .build();
        }
}