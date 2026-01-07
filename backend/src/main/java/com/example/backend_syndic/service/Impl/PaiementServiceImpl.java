package com.example.backend_syndic.service.Impl;

import com.example.backend_syndic.Dao.AppartementRepository;
import com.example.backend_syndic.Dao.PaiementRepository;
import com.example.backend_syndic.entity.Appartement;
import com.example.backend_syndic.entity.Paiement;
import com.example.backend_syndic.service.facade.AppartementService;
import com.example.backend_syndic.service.facade.PaiementService;
import com.example.backend_syndic.service.facade.ChargeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend_syndic.Dao.AppelChargeRepository;
import com.example.backend_syndic.Dao.StatusRepository;
import com.example.backend_syndic.entity.AppelCharge;
import com.example.backend_syndic.entity.Status;
import java.time.LocalDate;
import java.util.Calendar;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaiementServiceImpl implements PaiementService {

    @Autowired
    private PaiementRepository repo;
    
    @Autowired
    private AppelChargeRepository appelChargeRepo;

    @Autowired
    private StatusRepository statusRepo;

    @Override
    public List<Paiement> getAllPaiements() {
        return repo.findAll();
    }

    @Autowired
    private ChargeService chargeService;

    @Autowired
    private com.example.backend_syndic.service.facade.NotificationService notificationService;

    @Autowired
    private com.example.backend_syndic.service.facade.QuittancePDFService pdfService;

    @Autowired
    private AppartementService appartementService;

    @Autowired
    private com.example.backend_syndic.service.facade.ActivityLogService activityLogService;

    @Override
    public Paiement addPaiement(Paiement paiement, Long appartementId) {
        if (paiement.getMontant() <= 0) {
            throw new RuntimeException("Le montant doit être positif");
        }

        Appartement appartement = appartementService.getAppartementById(appartementId);
        paiement.setAppartement(appartement);
        
        if (paiement.getUser() == null) {
            if (appartement.getLocataire() != null) {
                paiement.setUser(appartement.getLocataire());
            } else if (appartement.getProprietaire() != null) {
                paiement.setUser(appartement.getProprietaire());
            }
        }

        if (paiement.getAppelCharge() != null && paiement.getAppelCharge().getId() != null) {
            AppelCharge appelCharge = appelChargeRepo.findById(paiement.getAppelCharge().getId())
                    .orElseThrow(() -> new RuntimeException("Appel de charge introuvable"));
            
            if (appelCharge.getStatus() != null && "PAYÉ".equals(appelCharge.getStatus().getLabel())) {
                 throw new RuntimeException("Cet appel de charge est déjà payé.");
            }
            
            Status statusPaye = statusRepo.findByLabel("PAYÉ")
                .orElseThrow(() -> new RuntimeException("Statut 'PAYÉ' introuvable en base de données"));

            // Mark as paid
            appelCharge.setStatus(statusPaye);
            appelChargeRepo.save(appelCharge);
            
            // Link to payment
            paiement.setAppelCharge(appelCharge);
        }

        Paiement savedPaiement = repo.save(paiement);

        // Generate PDF
        try {
            com.example.backend_syndic.entity.QuittancePDF pdf = pdfService.generateReçuPaiementPDF(savedPaiement.getId());
            savedPaiement.setQuittancePDF(pdf);
            savedPaiement = repo.save(savedPaiement);
        } catch (Exception e) {
            System.err.println("Error generating PDF for paiement " + savedPaiement.getId());
        }

        double totalCharges = chargeService.calculateChargePerAppartement(appartement.getImmeuble().getId());

        double totalPaiements = getPaiementsByAppartement(appartementId)
                .stream()
                .mapToDouble(Paiement::getMontant)
                .sum();

        double solde = totalCharges - totalPaiements;

        System.out.println("Remaining balance for Appartement " + appartementId + ": " + solde);

        // Send Notification
        if (savedPaiement.getUser() != null) {
            String message = "Votre paiement de " + savedPaiement.getMontant() + " MAD a bien été reçu. Reference: " + savedPaiement.getReference();
            notificationService.sendPaymentConfirmation(savedPaiement.getUser().getId(), message);
        }

        activityLogService.log("CREATE", "PAIEMENT", 
            "Nouveau paiement de " + savedPaiement.getMontant() + " DH pour l'appartement " + appartement.getNumero(),
            "Admin");

        return savedPaiement;
    }

    @Override
    public List<Paiement> getPaiementsByAppartement(Long appartementId) {
        return repo.findAll().stream()
                .filter(p -> p.getAppartement() != null && p.getAppartement().getId().equals(appartementId))
                .collect(Collectors.toList());
    }

    @Override
    public double calculateSoldeAppartement(Long appartementId) {
        double totalCharges = chargeService.calculateChargePerAppartement(appartementId);
        double totalPaiements = getPaiementsByAppartement(appartementId).stream()
                .mapToDouble(Paiement::getMontant)
                .sum();
        return totalCharges - totalPaiements;
    }

    @Override
    public Paiement updatePaiement(Long id, Paiement updatedPaiement) {
        Paiement existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement not found"));
        existing.setMontant(updatedPaiement.getMontant());
        existing.setDatePaiement(updatedPaiement.getDatePaiement());
        existing.setModePaiement(updatedPaiement.getModePaiement());
        existing.setReference(updatedPaiement.getReference());
        existing.setAppartement(updatedPaiement.getAppartement());
        existing.setUser(updatedPaiement.getUser());
        Paiement saved = repo.save(existing);

        activityLogService.log("UPDATE", "PAIEMENT", 
            "Mise à jour du paiement " + saved.getReference() + " (Montant: " + saved.getMontant() + " DH)", 
            "Admin");

        return saved;
    }

    @Override
    public void deletePaiement(Long id) {
        Paiement existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement not found"));
        
        String ref = existing.getReference();
        double amount = existing.getMontant();
        
        repo.delete(existing);

        activityLogService.log("DELETE", "PAIEMENT", 
            "Suppression du paiement " + ref + " d'un montant de " + amount + " DH", 
            "Admin");
    }

    @Override
    public Paiement getPaiementById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement not found"));
    }



    @Override
    public List<Paiement> getPaiementsByProprietaire(Long proprietaireId) {
        return repo.findAll().stream()
                .filter(p -> p.getUser() != null && p.getUser().getId().equals(proprietaireId))
                .collect(Collectors.toList());
    }

    @Override
    public List<Paiement> getPaiementsByImmeuble(Long immeubleId) {
        return repo.findAll().stream()
                .filter(p -> p.getAppartement() != null && p.getAppartement().getImmeuble() != null
                        && p.getAppartement().getImmeuble().getId().equals(immeubleId))
                .collect(Collectors.toList());
    }

    private boolean isSameMonthYear(LocalDate date, int month, int year) {
        return date.getMonthValue() == month && date.getYear() == year;
    }
    @Override
    public List<Paiement> getPaiementsByMonthAndYear(int month, int year) {
        return repo.findAll().stream()
                .filter(p -> p.getDatePaiement() != null && isSameMonthYear(p.getDatePaiement(), month, year))
                .collect(Collectors.toList());
    }


    private boolean isSameMonthYear(java.util.Date date, int month, int year) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        return cal.get(Calendar.MONTH) + 1 == month && cal.get(Calendar.YEAR) == year;
    }



    @Override
    public Paiement generateReçuPaiement(Long paiementId) {
        // Ici on renvoie juste le paiement, le PDF peut être généré plus tard
        return getPaiementById(paiementId);
    }
}
