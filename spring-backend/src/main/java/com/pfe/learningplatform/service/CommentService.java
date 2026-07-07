package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.CommentRequest;
import com.pfe.learningplatform.dto.CommentResponse;
import com.pfe.learningplatform.model.Comment;
import com.pfe.learningplatform.model.Course;
import com.pfe.learningplatform.model.Notification.NotificationType;
import com.pfe.learningplatform.model.Role;
import com.pfe.learningplatform.model.Section;
import com.pfe.learningplatform.model.User;
import com.pfe.learningplatform.repository.CommentRepository;
import com.pfe.learningplatform.repository.CourseRepository;
import com.pfe.learningplatform.repository.SectionRepository;
import com.pfe.learningplatform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository,
            UserRepository userRepository,
            CourseRepository courseRepository,
            SectionRepository sectionRepository,
            NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.sectionRepository = sectionRepository;
        this.notificationService = notificationService;
    }




    public List<CommentResponse> getCourseComments(Long courseId) {
        return commentRepository
                .findByCourseIdAndParentIsNullOrderByPinnedDescCreatedAtAsc(courseId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }




    public List<CommentResponse> getSectionComments(Long sectionId) {
        return commentRepository
                .findBySectionIdAndParentIsNullOrderByPinnedDescCreatedAtAsc(sectionId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }




    public CommentResponse addComment(String email, CommentRequest request) {
        if (request.getContent() == null || request.getContent().isBlank())
            throw new RuntimeException("Le commentaire ne peut pas être vide");

        User author = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Comment.CommentBuilder builder = Comment.builder()
                .content(request.getContent().trim())
                .author(author);


        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Cours introuvable"));
            builder.course(course);
        }
        if (request.getSectionId() != null) {
            Section section = sectionRepository.findById(request.getSectionId())
                    .orElseThrow(() -> new RuntimeException("Section introuvable"));
            builder.section(section);
        }


        if (request.getParentId() != null) {
            Comment parent = commentRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Commentaire parent introuvable"));
            builder.parent(parent);

            if (request.getCourseId() == null && parent.getCourse() != null)
                builder.course(parent.getCourse());
            if (request.getSectionId() == null && parent.getSection() != null)
                builder.section(parent.getSection());
        }

        Comment saved = commentRepository.save(builder.build());



        if (request.getParentId() != null) {
            commentRepository.findById(request.getParentId()).ifPresent(parent -> {
                Long sid = resolveSectionId(saved);
                Long cid = resolveCourseId(saved);
                notificationService.create(
                        parent.getAuthor(), NotificationType.REPLY,
                        author.getUsername(), saved.getContent(),
                        saved.getId(), sid, cid);
            });
        }

        return toResponse(saved);
    }




    public CommentResponse updateComment(String email, Long commentId, String newContent) {
        if (newContent == null || newContent.isBlank())
            throw new RuntimeException("Le commentaire ne peut pas être vide");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire introuvable"));


        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!comment.getAuthor().getId().equals(user.getId()) && !isAdmin)
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce commentaire");

        comment.setContent(newContent.trim());
        return toResponse(commentRepository.save(comment));
    }




    public void deleteComment(String email, Long commentId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire introuvable"));

        boolean isAdmin = user.getRole() == Role.ADMIN;
        if (!comment.getAuthor().getId().equals(user.getId()) && !isAdmin)
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer ce commentaire");


        if (isAdmin && !comment.getAuthor().getId().equals(user.getId())) {
            Long sid = resolveSectionId(comment);
            Long cid = resolveCourseId(comment);
            notificationService.create(
                    comment.getAuthor(), NotificationType.DELETED,
                    "Admin", comment.getContent(),
                    comment.getId(), sid, cid);
        }

        commentRepository.delete(comment);
    }




    public CommentResponse toggleLike(String email, Long commentId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire introuvable"));

        if (comment.getLikedByUserIds().contains(user.getId())) {
            comment.getLikedByUserIds().remove(user.getId());
        } else {
            comment.getLikedByUserIds().add(user.getId());

            Long sid = resolveSectionId(comment);
            Long cid = resolveCourseId(comment);
            notificationService.create(
                    comment.getAuthor(), NotificationType.LIKE,
                    user.getUsername(), comment.getContent(),
                    comment.getId(), sid, cid);
        }

        return toResponse(commentRepository.save(comment));
    }




    public CommentResponse togglePin(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Commentaire introuvable"));
        comment.setPinned(!comment.isPinned());
        Comment saved = commentRepository.save(comment);


        if (saved.isPinned()) {
            Long sid = resolveSectionId(saved);
            Long cid = resolveCourseId(saved);
            notificationService.create(
                    saved.getAuthor(), NotificationType.PINNED,
                    "Admin", saved.getContent(),
                    saved.getId(), sid, cid);
        }

        return toResponse(saved);
    }




    public List<CommentResponse> getAllComments() {
        return commentRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }






    private Long resolveCourseId(Comment comment) {
        if (comment.getCourse() != null)
            return comment.getCourse().getId();
        if (comment.getSection() != null && comment.getSection().getCourse() != null)
            return comment.getSection().getCourse().getId();
        return null;
    }

    private Long resolveSectionId(Comment comment) {
        return comment.getSection() != null ? comment.getSection().getId() : null;
    }

    private CommentResponse toResponse(Comment c) {

        List<CommentResponse> replies = c.getReplies() == null ? List.of()
                : c.getReplies().stream()
                        .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                        .map(this::toResponseFlat)
                        .collect(Collectors.toList());

        return CommentResponse.builder()
                .id(c.getId())
                .content(c.getContent())
                .authorId(c.getAuthor().getId())
                .authorUsername(c.getAuthor().getUsername())
                .authorAvatar(c.getAuthor().getProfilePicture())
                .courseId(c.getCourse() != null ? c.getCourse().getId() : null)
                .sectionId(c.getSection() != null ? c.getSection().getId() : null)
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .replies(replies)
                .likedByUserIds(c.getLikedByUserIds())
                .likesCount(c.getLikedByUserIds().size())
                .pinned(c.isPinned())
                .edited(c.isEdited())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }


    private CommentResponse toResponseFlat(Comment c) {
        return CommentResponse.builder()
                .id(c.getId())
                .content(c.getContent())
                .authorId(c.getAuthor().getId())
                .authorUsername(c.getAuthor().getUsername())
                .authorAvatar(c.getAuthor().getProfilePicture())
                .courseId(c.getCourse() != null ? c.getCourse().getId() : null)
                .sectionId(c.getSection() != null ? c.getSection().getId() : null)
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .replies(List.of())
                .likedByUserIds(c.getLikedByUserIds())
                .likesCount(c.getLikedByUserIds().size())
                .pinned(c.isPinned())
                .edited(c.isEdited())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}