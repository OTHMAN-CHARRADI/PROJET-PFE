package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.ContactRequest;
import com.pfe.learningplatform.dto.ContactResponse;
import com.pfe.learningplatform.model.ContactMessage;
import com.pfe.learningplatform.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ContactService {

    private final ContactMessageRepository contactMessageRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.admin-email}")
    private String adminEmail;



    private ContactResponse toResponse(ContactMessage m) {
        ContactResponse r = new ContactResponse();
        r.setId(m.getId());
        r.setName(m.getName());
        r.setEmail(m.getEmail());
        r.setSubject(m.getSubject());
        r.setMessage(m.getMessage());
        r.setRead(m.isRead());
        r.setReplied(m.isReplied());
        r.setReplyText(m.getReplyText());
        r.setRepliedAt(m.getRepliedAt());
        r.setCreatedAt(m.getCreatedAt());
        return r;
    }



    public ContactResponse submit(ContactRequest req) {
        if (req.getName() == null || req.getName().isBlank())
            throw new IllegalArgumentException("Le nom est obligatoire.");
        if (req.getEmail() == null || !req.getEmail().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))
            throw new IllegalArgumentException("Adresse e-mail invalide.");
        if (req.getMessage() == null || req.getMessage().isBlank())
            throw new IllegalArgumentException("Le message ne peut pas être vide.");

        ContactMessage msg = new ContactMessage();
        msg.setName(req.getName().trim());
        msg.setEmail(req.getEmail().trim().toLowerCase());
        msg.setSubject(req.getSubject() != null && !req.getSubject().isBlank()
                ? req.getSubject().trim()
                : "Sans sujet");
        msg.setMessage(req.getMessage().trim());
        msg.setRead(false);
        msg.setReplied(false);

        ContactMessage saved = contactMessageRepository.save(msg);
        log.info("Nouveau message de contact #{} de {} <{}>", saved.getId(), saved.getName(), saved.getEmail());

        sendAdminNotification(saved);
        sendAcknowledgement(saved);

        return toResponse(saved);
    }



    public List<ContactResponse> getAll() {
        return contactMessageRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }



    public ContactResponse markRead(Long id) {
        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message introuvable : " + id));
        msg.setRead(true);
        return toResponse(contactMessageRepository.save(msg));
    }



    public ContactResponse reply(Long id, String replyText) {
        if (replyText == null || replyText.isBlank())
            throw new IllegalArgumentException("La réponse ne peut pas être vide.");

        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Message introuvable : " + id));

        msg.setRead(true);
        msg.setReplied(true);
        msg.setReplyText(replyText.trim());
        msg.setRepliedAt(LocalDateTime.now());
        ContactMessage saved = contactMessageRepository.save(msg);

        sendReplyEmail(saved, replyText);
        log.info("Réponse envoyée à {} pour le message #{}", saved.getEmail(), id);
        return toResponse(saved);
    }



    public void delete(Long id) {
        if (!contactMessageRepository.existsById(id))
            throw new RuntimeException("Message introuvable : " + id);
        contactMessageRepository.deleteById(id);
    }



    private void sendAdminNotification(ContactMessage msg) {
        if (mailSender == null)
            return;
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(adminEmail);
            mail.setTo(adminEmail);
            mail.setSubject("[InfoAcademy] Nouveau message : " + msg.getSubject());
            mail.setText(
                    "Nouveau message reçu via le formulaire de contact.\n\n"
                            + "De      : " + msg.getName() + " <" + msg.getEmail() + ">\n"
                            + "Sujet   : " + msg.getSubject() + "\n"
                            + "Message :\n" + msg.getMessage());
            mailSender.send(mail);
            log.info("Notification admin envoyée à {}", adminEmail);
        } catch (Exception e) {
            log.warn("Notification admin non envoyée : {}", e.getMessage());
        }
    }

    private void sendAcknowledgement(ContactMessage msg) {
        if (mailSender == null)
            return;
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(adminEmail);
            mail.setTo(msg.getEmail());
            mail.setSubject("Votre message a bien été reçu — InfoAcademy");
            mail.setText(
                    "Bonjour " + msg.getName() + ",\n\n"
                            + "Nous avons bien reçu votre message et vous répondrons dans les meilleurs délais.\n\n"
                            + "L'équipe InfoAcademy");
            mailSender.send(mail);
        } catch (Exception e) {
            log.warn("Accusé de réception non envoyé : {}", e.getMessage());
        }
    }

    private void sendReplyEmail(ContactMessage msg, String replyText) {
        if (mailSender == null)
            return;
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setFrom(adminEmail);
            mail.setTo(msg.getEmail());
            mail.setSubject("Re : " + msg.getSubject() + " — InfoAcademy");
            mail.setText(
                    "Bonjour " + msg.getName() + ",\n\n"
                            + replyText
                            + "\n\n---\nL'équipe InfoAcademy");
            mailSender.send(mail);
        } catch (Exception e) {
            log.warn("Réponse e-mail non envoyée : {}", e.getMessage());
        }
    }
}