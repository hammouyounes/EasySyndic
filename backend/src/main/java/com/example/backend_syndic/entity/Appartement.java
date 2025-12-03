package com.example.backend_syndic.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Appartement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private  Long id;
    private String nemuro;
    private int etage;
    private double surface;

    @ManyToOne
    @JoinColumn(name= "immeuble_id")
    private Immeuble immeuble;

    @OneToMany(mappedBy = "appartement" , cascade = CascadeType.ALL,orphanRemoval = true)
    private List<Paiement> paiements;






    public Appartement() {

    }
    public Appartement(Long id, String nemuro, int etage, double surface) {
        this.id = id;
        this.nemuro = nemuro;
        this.etage = etage;
        this.surface = surface;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNemuro() {
        return nemuro;
    }

    public void setNemuro(String nemuro) {
        this.nemuro = nemuro;
    }

    public int getEtage() {
        return etage;
    }

    public void setEtage(int etage) {
        this.etage = etage;
    }

    public double getSurface() {
        return surface;
    }

    public void setSurface(double surface) {
        this.surface = surface;
    }

    public Immeuble getImmeuble() {
        return immeuble;
    }

    public void setImmeuble(Immeuble immeuble) {
        this.immeuble = immeuble;
    }

    public List<Paiement> getPaiements() {
        return paiements;
    }

    public void setPaiements(List<Paiement> paiements) {
        this.paiements = paiements;
    }
}
