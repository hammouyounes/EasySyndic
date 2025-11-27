package com.example.backend_syndic.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Charge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String type;
    private double montant;
    private String periode;

    @OneToMany(mappedBy = "charge",cascade = CascadeType.ALL,orphanRemoval = true)
    private List<AppelCharge> appelCharges;

    @ManyToOne
    @JoinColumn(name="immeuble_id")
    private Immeuble immeuble;

    public Charge() {}

    public Charge(Long id, String type, double montant, String periode, Immeuble immeuble) {
        this.id = id;
        this.type = type;
        this.montant = montant;
        this.periode = periode;
        this.immeuble = immeuble;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getMontant() {
        return montant;
    }

    public void setMontant(double montant) {
        this.montant = montant;
    }

    public String getPeriode() {
        return periode;
    }

    public void setPeriode(String periode) {
        this.periode = periode;
    }

    public Immeuble getImmeuble() {
        return immeuble;
    }

    public void setImmeuble(Immeuble immeuble) {
        this.immeuble = immeuble;
    }
}
