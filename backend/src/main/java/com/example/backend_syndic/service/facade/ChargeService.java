package com.example.backend_syndic.service.facade;

import com.example.backend_syndic.entity.Charge;
import java.util.List;

public interface ChargeService {

    Charge createCharge(Long immeubleId, Charge charge);

    // ✏️ Modifier une charge
    Charge updateCharge(Long id, Charge updatedCharge);

    // ❌ Supprimer une charge
    void deleteCharge(Long id);

    // 🔍 Retourner une charge par id
    Charge getChargeById(Long id);

    List<Charge> getAllCharges();

    // 📋 Retourner toutes les charges d'un immeuble
    List<Charge> getChargesByImmeuble(Long immeubleId);

    List<Charge> getChargesByYear(int year);

    List<Charge> getChargesByPeriode(int year, Integer month);

    // 💰 Calcul du total des charges pour un immeuble
    double calculateTotalChargesForImmeuble(Long immeubleId);




    double calculateChargePerAppartement(Long immeubleId);
}
