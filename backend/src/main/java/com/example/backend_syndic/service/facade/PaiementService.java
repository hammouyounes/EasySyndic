package com.example.backend_syndic.service.facade;

import com.example.backend_syndic.entity.Paiement;
import java.util.List;

public interface PaiementService {

    Paiement addPaiement(Paiement paiement, Long appartementId);

    List<Paiement> getAllPaiements();

    // ✏️ Modifier un paiement
    Paiement updatePaiement(Long id, Paiement updatedPaiement);

    // ❌ Supprimer un paiement
    void deletePaiement(Long id);

    // 🔍 Retourner un paiement par id
    Paiement getPaiementById(Long id);

    // 📋 Paiements par appartement
    List<Paiement> getPaiementsByAppartement(Long appartementId);

    // 📋 Paiements par propriétaire
    List<Paiement> getPaiementsByProprietaire(Long proprietaireId);

    // 📋 Paiements par immeuble
    List<Paiement> getPaiementsByImmeuble(Long immeubleId);

    // 📋 Paiements par mois et année
    List<Paiement> getPaiementsByMonthAndYear(int month, int year);

    // 💰 Calcul solde d'un appartement (total charges - total paiements)
    double calculateSoldeAppartement(Long appartementId);

    // 🧾 Générer reçu de paiement (pour PDF)
    Paiement generateReçuPaiement(Long paiementId);
}
