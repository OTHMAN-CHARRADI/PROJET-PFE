package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.MessageReplyDto;
import com.pfe.learningplatform.dto.UnifiedMessageResponse;
import com.pfe.learningplatform.dto.UnifiedMessageResponse.Source;
import com.pfe.learningplatform.dto.UnifiedReplyRequest;
import com.pfe.learningplatform.model.ContactMessage;
import com.pfe.learningplatform.model.MessageReply;
import com.pfe.learningplatform.model.Notification.NotificationType;
import com.pfe.learningplatform.repository.ContactMessageRepository;
import com.pfe.learningplatform.repository.MessageReplyRepository;
import com.pfe.learningplatform.repository.UserRepository;
import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.event.MessageCountAdapter;
import jakarta.mail.event.MessageCountEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.cache.annotation.CacheEvict;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.stream.Collectors;
import java.util.Comparator;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;
import jakarta.annotation.PreDestroy;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;


@Service
@Slf4j
public class UnifiedMessagingService {

    private final ContactMessageRepository contactRepo;
    private final MessageReplyRepository replyRepo;
    private final JavaMailSender mailSender;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Value("${spring.mail.username}")
    private String gmailAddress;

    @Value("${spring.mail.password}")
    private String gmailPassword;

    @Value("${app.admin-email}")
    private String adminEmail;



    private Store persistentStore;
    private Store idleStore;
    private final Object storeLock = new Object();



    private final CopyOnWriteArrayList<UnifiedMessageResponse> cachedMessages = new CopyOnWriteArrayList<>();
    private final AtomicBoolean refreshing = new AtomicBoolean(false);

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2, r -> {
        Thread t = new Thread(r, "gmail-idle");
        t.setDaemon(true);
        return t;
    });
    private volatile Folder idleFolder;

    public UnifiedMessagingService(ContactMessageRepository contactRepo,
            MessageReplyRepository replyRepo,
            JavaMailSender mailSender,
            NotificationService notificationService,
            UserRepository userRepository) {
        this.contactRepo = contactRepo;
        this.replyRepo = replyRepo;
        this.mailSender = mailSender;
        this.notificationService = notificationService;
        this.userRepository = userRepository;

        scheduler.execute(this::refreshCacheAsync);

        scheduler.execute(this::startIdleLoop);


        scheduler.scheduleAtFixedRate(this::refreshCacheAsync, 15, 10, TimeUnit.SECONDS);
    }


    private void refreshCacheAsync() {
        if (!refreshing.compareAndSet(false, true))
            return;
        try {
            List<UnifiedMessageResponse> all = new ArrayList<>();
            all.addAll(fetchContactMessages());
            all.addAll(fetchGmailMessagesDirect(20));
            all.sort(Comparator.comparing(UnifiedMessageResponse::getDate,
                    Comparator.nullsLast(Comparator.reverseOrder())));
            cachedMessages.clear();
            cachedMessages.addAll(all);
            log.debug("Cache messages rafraîchi : {} éléments", all.size());
        } catch (Exception e) {
            log.warn("Erreur refresh cache messages : {}", e.getMessage());
        } finally {
            refreshing.set(false);
        }
    }


    private void startIdleLoop() {
        while (!Thread.currentThread().isInterrupted()) {
            Folder folder = null;
            try {
                idleStore = createNewStore();
                folder = idleStore.getFolder("INBOX");
                folder.open(Folder.READ_ONLY);
                idleFolder = folder;

                final Folder f = folder;
                folder.addMessageCountListener(new MessageCountAdapter() {
                    @Override
                    public void messagesAdded(MessageCountEvent e) {
                        log.info("IDLE : {} nouveau(x) message(s) — refresh immédiat", e.getMessages().length);
                        refreshCacheAsync();
                    }
                });

                log.info("IMAP IDLE démarré — écoute des nouveaux emails...");


                while (!Thread.currentThread().isInterrupted() && folder.isOpen()) {
                    boolean idleSupported = false;
                    try {

                        java.lang.reflect.Method idleMethod = folder.getClass().getMethod("idle");
                        idleMethod.invoke(folder);
                        idleSupported = true;
                    } catch (NoSuchMethodException | java.lang.reflect.InvocationTargetException ex) {

                    }
                    if (!idleSupported) {

                        folder.getMessageCount();
                        Thread.sleep(5000);
                    }
                }
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                break;
            } catch (Exception e) {
                log.warn("IMAP IDLE interrompu ({}), reconnexion dans 5s...", e.getMessage());
                try {
                    if (idleStore != null && idleStore.isConnected())
                        idleStore.close();
                } catch (Exception ignored) {
                }
                idleStore = null;
                try {
                    Thread.sleep(5000);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    break;
                }
            } finally {
                if (folder != null && folder.isOpen()) {
                    try {
                        folder.close(false);
                    } catch (Exception ignored) {
                    }
                }
                idleFolder = null;
            }
        }
    }

    @PreDestroy
    public void closePersistentStore() {
        scheduler.shutdownNow();
        if (idleFolder != null && idleFolder.isOpen()) {
            try {
                idleFolder.close(false);
            } catch (Exception ignored) {
            }
        }
        try {
            if (idleStore != null)
                idleStore.close();
        } catch (Exception ignored) {
        }
        synchronized (storeLock) {
            if (persistentStore != null && persistentStore.isConnected()) {
                try {
                    persistentStore.close();
                } catch (Exception ignored) {
                }
                persistentStore = null;
            }
        }
    }






    public List<UnifiedMessageResponse> fetchAll(int gmailMax) {
        if (!cachedMessages.isEmpty()) {
            return new ArrayList<>(cachedMessages);
        }

        for (int i = 0; i < 30; i++) {
            try {
                Thread.sleep(500);
            } catch (InterruptedException ignored) {
            }
            if (!cachedMessages.isEmpty())
                break;
        }
        return new ArrayList<>(cachedMessages);
    }


    @CacheEvict(value = "allMessages", allEntries = true)
    public void evictCache() {
        cachedMessages.clear();
        scheduler.execute(this::refreshCacheAsync);
        log.info("Cache vidé et refresh forcé");
    }


    public void triggerBackgroundRefresh() {
        scheduler.execute(this::refreshCacheAsync);
        log.info("Refresh IMAP lancé en arrière-plan");
    }



    private List<UnifiedMessageResponse> fetchContactMessages() {
        return contactRepo.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toUnified)
                .collect(Collectors.toList());
    }

    private UnifiedMessageResponse toUnified(ContactMessage m) {
        UnifiedMessageResponse dto = new UnifiedMessageResponse();
        dto.setSource(Source.CONTACT_FORM);
        dto.setId(String.valueOf(m.getId()));
        dto.setFromName(m.getName());
        dto.setFromEmail(m.getEmail());
        dto.setSubject(m.getSubject());
        dto.setBody(m.getMessage());
        dto.setDate(m.getCreatedAt());
        dto.setRead(m.isRead());
        dto.setReplied(m.isReplied());
        dto.setReplyText(m.getReplyText());
        dto.setRepliedAt(m.getRepliedAt());
        dto.setBodyType("plain");

        dto.setReplyToEmail(m.getEmail());
        dto.setReplyToName(m.getName());


        List<MessageReplyDto> history = replyRepo
                .findByContactMessageIdOrderBySentAtAsc(m.getId())
                .stream().map(this::toReplyDto).collect(Collectors.toList());


        if (history.isEmpty()) {
            MessageReplyDto initial = new MessageReplyDto();
            initial.setDirection("USER");
            initial.setSenderName(m.getName());
            initial.setText(m.getMessage());
            initial.setSentAt(m.getCreatedAt());
            history.add(0, initial);
        }
        dto.setReplies(history);
        return dto;
    }



    private List<UnifiedMessageResponse> fetchGmailMessagesDirect(int maxEmails) {
        List<UnifiedMessageResponse> result = new ArrayList<>();
        Folder inbox = null;
        try {
            Store store = getOrConnectStore();
            inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);

            int total = inbox.getMessageCount();
            int start = Math.max(1, total - maxEmails + 1);
            Message[] messages = inbox.getMessages(start, total);

            for (int i = messages.length - 1; i >= 0; i--) {
                Message msg = messages[i];
                try {
                    UnifiedMessageResponse dto = new UnifiedMessageResponse();
                    dto.setSource(Source.GMAIL_INBOX);
                    dto.setId(String.valueOf(msg.getMessageNumber()));

                    InternetAddress addr = (InternetAddress) msg.getFrom()[0];
                    dto.setFromEmail(addr.getAddress());
                    dto.setFromName(addr.getPersonal());
                    dto.setSubject(msg.getSubject() != null ? msg.getSubject() : "(sans sujet)");
                    dto.setDate(msg.getReceivedDate() != null
                            ? msg.getReceivedDate().toInstant()
                                    .atZone(ZoneId.systemDefault()).toLocalDateTime()
                            : null);
                    dto.setRead(msg.isSet(Flags.Flag.SEEN));

                    String body = extractBodyRecursive(msg);
                    dto.setBody(body);
                    dto.setBodyType(body != null && body.trim().startsWith("<") ? "html" : "plain");


                    dto.setReplied(false);


                    String[] replyTo = resolveReplyTarget(
                            dto.getFromEmail(), dto.getFromName(), dto.getBody());
                    dto.setReplyToEmail(replyTo[0]);
                    dto.setReplyToName(replyTo[1]);

                    result.add(dto);
                } catch (Exception e) {
                    log.warn("Erreur lecture email Gmail #{}: {}", msg.getMessageNumber(), e.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Erreur connexion IMAP Gmail: {}", e.getMessage());

            synchronized (storeLock) {
                persistentStore = null;
            }
        } finally {
            if (inbox != null && inbox.isOpen()) {
                try {
                    inbox.close(false);
                } catch (Exception ignored) {
                }
            }
        }
        return result;
    }






    public void reply(UnifiedReplyRequest req) {
        if (req.getSource() == Source.CONTACT_FORM) {
            replyToContactMessage(Long.parseLong(req.getId()), req.getReplyText());
        } else {
            replyToGmailMessage(req.getToEmail(), req.getToName(),
                    req.getOriginalSubject(), req.getReplyText());
        }
    }



    private void replyToContactMessage(Long id, String replyText) {
        if (replyText == null || replyText.isBlank())
            throw new IllegalArgumentException("La réponse ne peut pas être vide.");

        ContactMessage msg = contactRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Message introuvable : " + id));

        msg.setRead(true);
        msg.setReplied(true);
        msg.setReplyText(replyText.trim());
        msg.setRepliedAt(LocalDateTime.now());
        contactRepo.save(msg);


        MessageReply reply = new MessageReply();
        reply.setContactMessage(msg);
        reply.setDirection("ADMIN");
        reply.setSenderName("InfoAcademy");
        reply.setText(replyText.trim());
        replyRepo.save(reply);

        sendEmail(msg.getEmail(), "Re : " + msg.getSubject() + " — InfoAcademy",
                buildReplyBody(msg.getName(), replyText));
        log.info("Réponse envoyée (contact form) à {} pour le message #{}", msg.getEmail(), id);


        userRepository.findByEmail(msg.getEmail()).ifPresent(user -> notificationService.create(
                user, NotificationType.SUPPORT_REPLY,
                "Admin", msg.getSubject(),
                null, null, null));
    }



    private void replyToGmailMessage(String toEmail, String toName,
            String originalSubject, String replyText) {
        sendEmail(toEmail, "Re: " + originalSubject,
                buildReplyBody(toName, replyText));
        log.info("Réponse envoyée (Gmail inbox) à {}", toEmail);
        evictCache();
    }






    public UnifiedMessageResponse markContactRead(Long id) {
        ContactMessage msg = contactRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Message introuvable : " + id));
        msg.setRead(true);
        return toUnified(contactRepo.save(msg));
    }


    public void deleteContact(Long id) {
        if (!contactRepo.existsById(id))
            throw new RuntimeException("Message introuvable : " + id);
        contactRepo.deleteById(id);
    }


    public void deleteGmailMessage(int messageNumber) {
        Folder inbox = null;
        try {
            Store store = getOrConnectStore();
            inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_WRITE);

            Message msg = inbox.getMessage(messageNumber);
            if (msg == null) {
                throw new RuntimeException("Email Gmail introuvable : numéro " + messageNumber);
            }
            msg.setFlag(Flags.Flag.DELETED, true);
            inbox.expunge();
            log.info("Email Gmail #{} supprimé définitivement via IMAP", messageNumber);
        } catch (MessagingException e) {
            log.error("Erreur suppression email Gmail #{}: {}", messageNumber, e.getMessage());
            synchronized (storeLock) {
                persistentStore = null;
            }
            throw new RuntimeException("Impossible de supprimer l'email Gmail : " + e.getMessage());
        } finally {
            if (inbox != null && inbox.isOpen()) {
                try {
                    inbox.close(false);
                } catch (Exception ignored) {
                }
            }
        }

        evictCache();
    }





    private MessageReplyDto toReplyDto(MessageReply r) {
        MessageReplyDto dto = new MessageReplyDto();
        dto.setId(r.getId());
        dto.setDirection(r.getDirection());
        dto.setSenderName(r.getSenderName());
        dto.setText(r.getText());
        dto.setSentAt(r.getSentAt());
        return dto;
    }


    private String[] resolveReplyTarget(String fromEmail, String fromName, String body) {

        if (body != null) {
            Pattern p = Pattern.compile("De\s*:\s*.+?<([^>]+@[^>]+)>", Pattern.CASE_INSENSITIVE);
            Matcher m = p.matcher(body);
            if (m.find()) {
                String extractedEmail = m.group(1).trim();

                Pattern pName = Pattern.compile("De\s*:\s*([^<\n]+)<", Pattern.CASE_INSENSITIVE);
                Matcher mName = pName.matcher(body);
                String extractedName = mName.find() ? mName.group(1).trim() : extractedEmail;
                log.debug("Email interne détecté → réponse extraite vers {} <{}>", extractedName, extractedEmail);
                return new String[] { extractedEmail, extractedName };
            }
        }

        return new String[] { fromEmail, fromName != null ? fromName : fromEmail };
    }



    private Store createNewStore() throws MessagingException {
        Properties props = new Properties();
        props.put("mail.store.protocol", "imaps");
        props.put("mail.imaps.host", "imap.gmail.com");
        props.put("mail.imaps.port", "993");
        props.put("mail.imaps.ssl.enable", "true");
        props.put("mail.imaps.connectiontimeout", "10000");
        props.put("mail.imaps.timeout", "10000");
        props.put("mail.imaps.usesocketchannels", "true");
        Session session = Session.getInstance(props);
        Store store = session.getStore("imaps");
        store.connect("imap.gmail.com", gmailAddress, gmailPassword);
        return store;
    }

    private Store getOrConnectStore() throws MessagingException {
        synchronized (storeLock) {
            if (persistentStore != null && persistentStore.isConnected()) {
                return persistentStore;
            }
            log.info("Connexion IMAP Gmail...");
            Properties props = new Properties();
            props.put("mail.store.protocol", "imaps");
            props.put("mail.imaps.host", "imap.gmail.com");
            props.put("mail.imaps.port", "993");
            props.put("mail.imaps.ssl.enable", "true");
            props.put("mail.imaps.connectiontimeout", "10000");
            props.put("mail.imaps.timeout", "10000");

            props.put("mail.imaps.usesocketchannels", "true");

            Session session = Session.getInstance(props);
            persistentStore = session.getStore("imaps");
            persistentStore.connect("imap.gmail.com", gmailAddress, gmailPassword);
            log.info("Connexion IMAP établie");
            return persistentStore;
        }
    }

    private String extractBodyRecursive(Part part) throws Exception {
        if (part.isMimeType("text/html"))
            return (String) part.getContent();
        if (part.isMimeType("text/plain"))
            return (String) part.getContent();

        if (part.isMimeType("multipart/alternative")) {
            MimeMultipart mp = (MimeMultipart) part.getContent();
            String plain = null;
            for (int i = 0; i < mp.getCount(); i++) {
                BodyPart bp = mp.getBodyPart(i);
                if (bp.isMimeType("text/html"))
                    return (String) bp.getContent();
                if (bp.isMimeType("text/plain") && plain == null)
                    plain = (String) bp.getContent();
            }
            return plain != null ? plain : "(contenu vide)";
        }

        if (part.isMimeType("multipart/*")) {
            MimeMultipart mp = (MimeMultipart) part.getContent();
            String plain = null;
            for (int i = 0; i < mp.getCount(); i++) {
                BodyPart bp = mp.getBodyPart(i);
                String disp = bp.getDisposition();
                if (disp != null && disp.equalsIgnoreCase(Part.ATTACHMENT))
                    continue;
                String r = extractBodyRecursive(bp);
                if (r != null && !r.isBlank()) {
                    if (r.trim().startsWith("<"))
                        return r;
                    if (plain == null)
                        plain = r;
                }
            }
            return plain != null ? plain : "(contenu vide)";
        }
        return "(contenu non lisible)";
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            jakarta.mail.internet.MimeMessage mime = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, false, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text, false);
            mailSender.send(mime);
        } catch (Exception e) {
            log.error("Erreur envoi email à {}: {}", to, e.getMessage());
            throw new RuntimeException("Impossible d'envoyer l'email : " + e.getMessage());
        }
    }

    private String buildReplyBody(String name, String replyText) {
        return "Bonjour " + (name != null ? name : "") + ",\n\n"
                + replyText
                + "\n\n---\nL'équipe InfoAcademy";
    }
}