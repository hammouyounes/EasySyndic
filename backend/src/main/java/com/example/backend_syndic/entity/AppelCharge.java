package com.example.backend_syndic.entity;

import jakarta.persistence.*;

import java.util.Date;


@Entity
public class AppelCharge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Date dateEmission ;
    private double total;

    @ManyToOne
    @JoinColumn(name="charge_id")
    private Charge charge;

    public AppelCharge() {}

    public AppelCharge(Long id, Date dateEmission, double total, Charge charge) {
        this.id = id;
        this.dateEmission = dateEmission;
        this.total = total;
        this.charge = charge;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Date getDateEmission() {
        return dateEmission;
    }

    public void setDateEmission(Date dateEmission) {
        this.dateEmission = dateEmission;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public Charge getCharge() {
        return charge;
    }

    public void setCharge(Charge charge) {
        this.charge = charge;
    }
}
