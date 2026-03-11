package com.example.backend_syndic.entity;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import com.example.backend_syndic.enums.ChargeType;

@Entity
public class Charge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;
    private Double montant;
    private String periode;
    
    @Enumerated(EnumType.STRING)
    private ChargeType chargeType;

    private Boolean isRecurring;

    @OneToMany(mappedBy = "charge")
    private List<AppelCharge> appelCharges;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(
            name = "immeuble_id",
            nullable = false   
    )
    @JsonIgnoreProperties({"charges", "appartements", "hibernateLazyInitializer", "handler"})
    private Immeuble immeuble;

    private Integer diviser = 0;

    @Column(columnDefinition = "LONGTEXT")
    private String recu; // stores Base64 content of the image/pdf

    public String getRecu() {
        return recu;
    }

    public void setRecu(String recu) {
        this.recu = recu;
    }

    @PrePersist
    public void prePersist() {
        if (this.diviser == null) {
            this.diviser = 0;
        }
    }

    public Charge() {}

    public Charge(Long id, String type, Double montant, String periode, Immeuble immeuble) {
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

    public Double getMontant() {
        return montant;
    }

    public void setMontant(Double montant) {
        this.montant = montant;
    }

    public String getPeriode() {
        return periode;
    }

    public void setPeriode(String periode) {
        this.periode = periode;
    }

    public ChargeType getChargeType() {
        return chargeType;
    }

    public void setChargeType(ChargeType chargeType) {
        this.chargeType = chargeType;
    }

    public Boolean getIsRecurring() {
        return isRecurring;
    }

    public void setIsRecurring(Boolean isRecurring) {
        this.isRecurring = isRecurring;
    }

    public Immeuble getImmeuble() {
        return immeuble;
    }

    public void setImmeuble(Immeuble immeuble) {
        this.immeuble = immeuble;
    }

    public Integer getDiviser() {
        return diviser;
    }

    public void setDiviser(Integer diviser) {
        this.diviser = diviser;
    }

    @Transient
    private boolean locked;

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }
    @Transient
    private double progress;

    public double getProgress() {
        return progress;
    }

    public void setProgress(double progress) {
        this.progress = progress;
    }
}
