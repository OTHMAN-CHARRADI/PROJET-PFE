package com.pfe.learningplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponse {

    private Long id;
    private String content;

    private Long authorId;
    private String authorUsername;
    private String authorAvatar;

    private Long courseId;
    private Long sectionId;
    private Long parentId;

    private List<CommentResponse> replies;
    private Set<Long> likedByUserIds;
    private int likesCount;

    private boolean pinned;
    private boolean edited;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
