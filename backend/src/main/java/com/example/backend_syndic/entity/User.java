package com.example.backend_syndic.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String prenom;
    private String email;
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(columnDefinition = "boolean default true")
    private Boolean active = true;

    public enum Role {
        ADMIN,
        PROPRIETAIRE,
        LOCATAIRE
    }

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Notification> notifications;

    @OneToMany(mappedBy = "user")
    @JsonIgnore
    private List<Paiement> paiements;

    @OneToMany(mappedBy = "proprietaire")
    @JsonIgnore
    private List<Appartement> appartementsPossedes;

    @OneToMany(mappedBy = "locataire")
    @JsonIgnore
    private List<Appartement> appartementsLoues;

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

    public String getPrenom() {
        return prenom;
    }

    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMotDePasse() {
        return motDePasse;
    }

    public void setMotDePasse(String motDePasse) {
        this.motDePasse = motDePasse;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }

    public List<Paiement> getPaiements() {
        return paiements;
    }

    public void setPaiements(List<Paiement> paiements) {
        this.paiements = paiements;
    }

    public List<Appartement> getAppartementsPossedes() {
        return appartementsPossedes;
    }

    public void setAppartementsPossedes(List<Appartement> appartementsPossedes) {
        this.appartementsPossedes = appartementsPossedes;
    }

    public List<Appartement> getAppartementsLoues() {
        return appartementsLoues;
    }

    public void setAppartementsLoues(List<Appartement> appartementsLoues) {
        this.appartementsLoues = appartementsLoues;
    }
    @Transient
    private Boolean canToggleStatus = true;

    public Boolean getCanToggleStatus() {
        return canToggleStatus;
    }

    public void setCanToggleStatus(Boolean canToggleStatus) {
        this.canToggleStatus = canToggleStatus;
    }
}
