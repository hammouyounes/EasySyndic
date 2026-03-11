package com.example.backend_syndic.service.facade;

import com.example.backend_syndic.entity.Appartement;

import java.util.List;

public interface AppartementService {

    // ➕ Ajouter un appartement à un immeuble
    Appartement createAppartement(Long immeubleId, Appartement appartement);

    // ✏️ Update
    Appartement updateAppartement(Long id, Appartement updated);

    // ❌ Delete
    void deleteAppartement(Long id);

    // 🔍 Get by id
    Appartement getAppartementById(Long id);

    // 📋 Get all
    List<Appartement> getAllAppartements();

    // 🏠 Get by Immeuble
    List<Appartement> getAppartementsByImmeubleId(Long immeubleId);


    Appartement assignProprietaire(Long appartementId, Long proprietaireId);

    Appartement assignLocataire(Long appartementId, Long locataireId);

    Appartement removeProprietaire(Long appartementId);

    Appartement removeLocataire(Long appartementId);

    // 🔢 Calculer surface totale d’un immeuble (optionnel)
    double calculateSurfaceTotaleByImmeuble(Long immeubleId);
}
