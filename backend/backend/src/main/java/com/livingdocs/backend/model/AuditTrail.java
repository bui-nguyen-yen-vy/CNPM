package com.livingdocs.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_trails")
@Data
public class AuditTrail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String documentId;
    private String action; // APPROVED, REJECTED, PUBLISHED
    private String actorRole; // STAFF, MANAGER
    private String actorName; // Bui Nguyen Yen Vy, Minh Tran Thanh
    private LocalDateTime timestamp;
    
    @Column(columnDefinition = "TEXT")
    private String feedback;
}
