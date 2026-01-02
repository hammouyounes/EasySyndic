package com.example.backend_syndic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action; // CREATE, UPDATE, DELETE
    private String targetType; // PAIEMENT, USER, IMMEUBLE, etc.
    private String description;
    private LocalDateTime timestamp;
    
    // We could link to the User who performed the action if security is fully implemented
    private String performedBy; 

    public ActivityLog(String action, String targetType, String description, String performedBy) {
        this.action = action;
        this.targetType = targetType;
        this.description = description;
        this.performedBy = performedBy;
        this.timestamp = LocalDateTime.now();
    }
}
