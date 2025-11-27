package com.example.backend_syndic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private String email;
    private String type ;
    private Date dateEnvoi;

    @ManyToOne
    @JoinColumn(name= "user_id")
    private User user;
}
