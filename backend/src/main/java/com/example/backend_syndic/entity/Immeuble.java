package com.example.backend_syndic.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;


@Data
@NoArgsConstructor
@JsonIgnoreProperties(value = {"appartements", "charges"}, ignoreUnknown = true)
@Entity
public class Immeuble {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String adress;
    private Integer nombreAppartement; // Current count (can be derived, but kept for compatibility)
    private Integer nombreEtages;
    private Integer nombreAppartementsMax;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "syndic_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User syndic;

    @OneToMany(mappedBy = "immeuble", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Appartement> appartements;

    @OneToMany(mappedBy = "immeuble")
    private List<Charge> charges;

}
