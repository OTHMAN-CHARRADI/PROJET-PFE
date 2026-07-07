package com.pfe.learningplatform.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "section_completions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "section_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionCompletion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id")
    private Section section;

    private LocalDateTime completedAt;

    @PrePersist
    public void prePersist() {
        completedAt = LocalDateTime.now();
    }
}
