package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.NotificationResponse;
import com.pfe.learningplatform.model.Notification;
import com.pfe.learningplatform.model.Notification.NotificationType;
import com.pfe.learningplatform.model.User;
import com.pfe.learningplatform.repository.NotificationRepository;
import com.pfe.learningplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

        private final NotificationRepository notificationRepository;
        private final UserRepository userRepository;


        public void create(User recipient, NotificationType type,
                        String actorUsername, String commentPreview,
                        Long commentId, Long sectionId, Long courseId) {


                if (actorUsername != null && actorUsername.equals(recipient.getUsername()))
                        return;

                Notification notif = Notification.builder()
                                .recipient(recipient)
                                .type(type)
                                .actorUsername(actorUsername)
                                .commentPreview(commentPreview != null
                                                ? commentPreview.substring(0, Math.min(commentPreview.length(), 100))
                                                : null)
                                .commentId(commentId)
                                .sectionId(sectionId)
                                .courseId(courseId)
                                .build();

                notificationRepository.save(notif);
        }


        public List<NotificationResponse> getForUser(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

                return notificationRepository
                                .findByRecipientIdOrderByCreatedAtDesc(user.getId())
                                .stream().map(this::toResponse)
                                .collect(Collectors.toList());
        }


        public Map<String, Long> countUnread(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
                long count = notificationRepository.countByRecipientIdAndReadFalse(user.getId());
                return Map.of("count", count);
        }


        public void markAllRead(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

                List<Notification> unread = notificationRepository
                                .findByRecipientIdOrderByCreatedAtDesc(user.getId())
                                .stream().filter(n -> !n.isRead()).collect(Collectors.toList());

                unread.forEach(n -> n.setRead(true));
                notificationRepository.saveAll(unread);
        }


        public void markOneRead(Long notifId, String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

                notificationRepository.findById(notifId).ifPresent(n -> {
                        if (n.getRecipient().getId().equals(user.getId())) {
                                n.setRead(true);
                                notificationRepository.save(n);
                        }
                });
        }


        public void deleteOne(Long notifId, String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

                notificationRepository.findById(notifId).ifPresent(n -> {
                        if (n.getRecipient().getId().equals(user.getId())) {
                                notificationRepository.delete(n);
                        }
                });
        }


        public void deleteAll(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

                List<Notification> notifs = notificationRepository
                                .findByRecipientIdOrderByCreatedAtDesc(user.getId());
                notificationRepository.deleteAll(notifs);
        }

        private NotificationResponse toResponse(Notification n) {
                return NotificationResponse.builder()
                                .id(n.getId())
                                .type(n.getType())
                                .actorUsername(n.getActorUsername())
                                .commentPreview(n.getCommentPreview())
                                .commentId(n.getCommentId())
                                .sectionId(n.getSectionId())
                                .courseId(n.getCourseId())
                                .read(n.isRead())
                                .createdAt(n.getCreatedAt())
                                .build();
        }
}
