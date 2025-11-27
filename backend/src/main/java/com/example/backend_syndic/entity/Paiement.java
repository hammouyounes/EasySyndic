package com.example.backend_syndic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private double montant;
    private Date datePaiement;
    private String modePaiement;
    private String reference;



    @ManyToOne
    @JoinColumn(name= "appartement_id")
    private Appartement appartement;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name="quittancePDF_id")
    private QuittancePDF quittancePDF;
    @ManyToOne
    @JoinColumn(name= "user_id")
    private User user;
}
