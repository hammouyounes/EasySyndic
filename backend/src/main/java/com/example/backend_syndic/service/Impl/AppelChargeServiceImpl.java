package com.example.backend_syndic.service.Impl;

import com.example.backend_syndic.Dao.AppelChargeRepository;
import com.example.backend_syndic.Dao.ChargeRepository;
import com.example.backend_syndic.Dao.PaiementRepository;
import com.example.backend_syndic.Dao.StatusRepository;
import com.example.backend_syndic.entity.Appartement;
import com.example.backend_syndic.entity.AppelCharge;
import com.example.backend_syndic.entity.Charge;
import com.example.backend_syndic.entity.Immeuble;
import com.example.backend_syndic.entity.Status;
import com.example.backend_syndic.service.facade.AppelChargeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
@Transactional
public class AppelChargeServiceImpl implements AppelChargeService {

    @Autowired
    private AppelChargeRepository repo;

    @Autowired
    private ChargeRepository chargeRepository;

    @Autowired
    private StatusRepository statusRepository;

    @Autowired
    private PaiementRepository paiementRepository;

    @Override
    public void distributeCharge(Long chargeId) {
        Charge charge = chargeRepository.findById(chargeId)
                .orElseThrow(() -> new RuntimeException("Charge not found"));

        Immeuble immeuble = charge.getImmeuble();
        List<Appartement> appartements = immeuble.getAppartements();

        if (appartements == null || appartements.isEmpty()) {
            throw new RuntimeException("Aucun appartement trouvé pour distribuer la charge.");
        }

        double surfaceTotale = appartements.stream()
                .mapToDouble(a -> a.getSurface() != null ? a.getSurface() : 0.0)
                .sum();

        if (surfaceTotale <= 0) {
            throw new RuntimeException("La surface totale de l'immeuble est invalide (0). Impossible de calculer les tantièmes.");
        }

        // Get or Create default status
        Status statusEnAttente = statusRepository.findByLabel("EN_ATTENTE")
                .orElseGet(() -> statusRepository.save(new Status(null, "EN_ATTENTE")));

        for (Appartement appt : appartements) {
            double surface = appt.getSurface() != null ? appt.getSurface() : 0.0;
            double shareAmount = (surface / surfaceTotale) * charge.getMontant();

            AppelCharge appel = new AppelCharge();
            appel.setCharge(charge);
            appel.setAppartement(appt);
            appel.setStatus(statusEnAttente);
            appel.setTotal(shareAmount);
            appel.setDateEmission(new Date());

            repo.save(appel);
        }

        charge.setDiviser(1);
        chargeRepository.save(charge);
    }

    @Override
    public void undoDistributeCharge(Long chargeId) {
        Charge charge = chargeRepository.findById(chargeId)
                .orElseThrow(() -> new RuntimeException("Charge not found"));

        List<AppelCharge> appels = repo.findByCharge(charge);

        // Check for existing payments
        for (AppelCharge appel : appels) {
            if (paiementRepository.existsByAppelCharge(appel)) {
                throw new RuntimeException("Impossible de supprimer la distribution : des paiements ont déjà été effectués pour cette charge.");
            }
        }

        repo.deleteAll(appels);

        charge.setDiviser(0);
        chargeRepository.save(charge);
    }
    @Override
    public List<AppelCharge> getAllAppelCharges() {
        return repo.findAll();
    }
}
