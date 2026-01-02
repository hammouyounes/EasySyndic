package com.example.backend_syndic.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"appartements", "charges"})
@Entity
public class Immeuble {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String adress;
    private int nombreAppartement; // Current count (can be derived, but kept for compatibility)
    private int nombreEtages;
    private int nombreAppartementsMax;

    @OneToMany(mappedBy = "immeuble", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appartement> appartements;

    @OneToMany(mappedBy = "immeuble")
    private List<Charge> charges;

}
