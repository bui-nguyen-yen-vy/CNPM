package com.livingdocs.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "documents")
@Data
public class Document {
    @Id
    private String id;
    private String name;
    private String repository;
    private String severity;
    private String submissionDate;
    
    @Column(columnDefinition = "TEXT")
    private String oldContent;
    
    @Column(columnDefinition = "TEXT")
    private String newContent;
    
    private String commitHash;
    private String triggerSource;
    private String diffAnalyzed;
    private String targetTemplate;
    private String associatedTicket;
    private String confidenceScore;

    @Column(columnDefinition = "TEXT DEFAULT 'PENDING'")
    private String status; 
}