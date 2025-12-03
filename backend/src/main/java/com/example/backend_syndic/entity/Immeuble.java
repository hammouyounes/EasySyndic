package com.example.backend_syndic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity

public class Immeuble {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private String nom;
    private String adress;
    private int NombreAppartement;

    @OneToMany(mappedBy = "immeuble" , cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Appartement> appartements;

    @OneToMany(mappedBy = "immeuble",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Charge> charges;

    public Immeuble() {
    }
    public Immeuble(Long id, String nom, String adress, int NombreAppartement) {
        this.id = id;
        this.nom = nom;
        this.adress = adress;
        this.NombreAppartement = NombreAppartement;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getAdress() {
        return adress;
    }

    public void setAdress(String adress) {
        this.adress = adress;
    }

    public int getNombreAppartement() {
        return NombreAppartement;
    }

    public void setNombreAppartement(int NombreAppartement) {
        this.NombreAppartement = NombreAppartement;
    }
    public List<Appartement> getAppartements() {
        return appartements;
    }

    public void setAppartements(List<Appartement> appartements) {
        this.appartements = appartements;
    }

}
