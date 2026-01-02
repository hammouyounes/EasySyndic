package com.example.backend_syndic.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Appartement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String numero;
    private int etage;
    private double surface;

    @ManyToOne
    @JoinColumn(name = "immeuble_id")
    @JsonIgnoreProperties({"appartements", "charges"})
    private Immeuble immeuble;

    @ManyToOne
    @JoinColumn(name = "proprietaire_id")
    private User proprietaire;

    @ManyToOne
    @JoinColumn(name = "locataire_id")
    private User locataire;

    @OneToMany(mappedBy = "appartement", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Paiement> paiements;
}
