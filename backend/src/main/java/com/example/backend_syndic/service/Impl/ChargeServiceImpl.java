package com.example.backend_syndic.service.Impl;

import com.example.backend_syndic.Dao.ChargeRepository;
import com.example.backend_syndic.Dao.ImmeubleRepository;
import com.example.backend_syndic.entity.Charge;
import com.example.backend_syndic.entity.Immeuble;
import com.example.backend_syndic.service.facade.ChargeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChargeServiceImpl implements ChargeService {

    @Autowired
    private ChargeRepository repo;

    @Autowired
    private ImmeubleRepository immeubleRepository;

    @Autowired
    private com.example.backend_syndic.service.facade.ActivityLogService activityLogService;

    @Autowired
    private com.example.backend_syndic.service.facade.NotificationService notificationService;

    @Override
    public Charge createCharge(Long immeubleId, Charge charge) {
        Immeuble immeuble = immeubleRepository.findById(immeubleId)
                .orElseThrow(() -> new RuntimeException("Immeuble not found"));

        charge.setImmeuble(immeuble);
        
        // Default to current month if missing
        if (charge.getPeriode() == null || charge.getPeriode().isEmpty()) {
            charge.setPeriode(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM")));
        }

        Charge saved = repo.save(charge);
        activityLogService.log("CREATE", "CHARGE", 
            "Nouvelle charge de type " + saved.getType() + " (" + saved.getMontant() + " DH) pour l'immeuble " + immeuble.getNom(), 
            "Admin");

        // Notification des locataires
        try {
            int nbAppartements = immeuble.getAppartements() != null ? immeuble.getAppartements().size() : 0;
            if (nbAppartements > 0) {
                double partParAppartement = saved.getMontant() / nbAppartements;
                String notificationMessage = String.format(
                    "Une nouvelle charge de type %s a été ajoutée pour votre immeuble %s. Votre part est de %.2f DH pour la période %s.",
                    saved.getType(), immeuble.getNom(), partParAppartement, saved.getPeriode()
                );

                if (immeuble.getAppartements() != null) {
                    immeuble.getAppartements().stream()
                        .filter(a -> a.getLocataire() != null)
                        .forEach(a -> {
                            notificationService.notifyNewCharge(a.getLocataire().getId(), notificationMessage);
                        });
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi des notifications de charge: " + e.getMessage());
        }

        return saved;
    }


    @Override
    public Charge updateCharge(Long id, Charge updatedCharge) {
        Charge existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Charge not found"));
        existing.setType(updatedCharge.getType());
        existing.setMontant(updatedCharge.getMontant());
        existing.setPeriode(updatedCharge.getPeriode());
        Charge saved = repo.save(existing);
        
        activityLogService.log("UPDATE", "CHARGE", 
            "Mise à jour de la charge " + saved.getType() + " (" + saved.getMontant() + " DH)", 
            "Admin");

        return saved;
    }

    @Override
    public void deleteCharge(Long id) {
        Charge existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Charge not found"));
        String type = existing.getType();
        double amount = existing.getMontant();
        
        repo.delete(existing);

        activityLogService.log("DELETE", "CHARGE", 
            "Suppression de la charge " + type + " de " + amount + " DH", 
            "Admin");
    }

    @Override
    public Charge getChargeById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Charge not found"));
    }

    @Override
    public List<Charge> getAllCharges(){
        return repo.findAll();
    }

    @Override
    public List<Charge> getChargesByImmeuble(Long immeubleId) {
        return repo.findAll().stream()
                .filter(c -> c.getImmeuble() != null && c.getImmeuble().getId().equals(immeubleId))
                .collect(Collectors.toList());
    }

    @Override
    public List<Charge> getChargesByYear(int year) {
        String yearStr = String.valueOf(year);
        return repo.findByYear(yearStr);
    }
    @Override
    public List<Charge> getChargesByPeriode(int year, Integer month) {
        String yearStr = String.valueOf(year);

        if (month == null) {
            // only year filter
            return repo.findByYear(yearStr);
        } else {
            // format month to 2 digits: "04"
            String monthStr = String.format("%02d", month);
            return repo.findByMonthAndYear(monthStr, yearStr);
        }
    }

    private boolean isSameYear(String periode, int year) {
        // periode format: "YYYY-MM"
        return periode.startsWith(String.valueOf(year));
    }


    @Override
    public double calculateTotalChargesForImmeuble(Long immeubleId) {
        return getChargesByImmeuble(immeubleId).stream()
                .mapToDouble(Charge::getMontant)
                .sum();
    }

    @Override
    public double calculateChargePerAppartement(Long immeubleId) {
        // get total charges
        double total = calculateTotalChargesForImmeuble(immeubleId);

        // get the number of appartements in the immeuble
        Immeuble immeuble = immeubleRepository.findById(immeubleId)
                .orElseThrow(() -> new RuntimeException("Immeuble not found"));

        int nombreAppartement = immeuble.getAppartements() != null ? immeuble.getAppartements().size() : 0;
        if (nombreAppartement == 0) {
            throw new RuntimeException("No appartements in this immeuble");
        }

        // divide total by number of appartements
        return total / nombreAppartement;
    }

}
