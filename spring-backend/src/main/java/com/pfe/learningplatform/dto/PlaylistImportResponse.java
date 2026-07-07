package com.pfe.learningplatform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
public class PlaylistImportResponse {

    private Long courseId;
    private String courseTitle;
    private int sectionsCreated;
    private List<String> sectionTitles;
}