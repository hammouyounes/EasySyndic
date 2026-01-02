package com.example.backend_syndic.service.Impl;

import com.example.backend_syndic.Dao.AppartementRepository;
import com.example.backend_syndic.Dao.ImmeubleRepository;
import com.example.backend_syndic.Dao.UserRepository;
import com.example.backend_syndic.entity.Appartement;
import com.example.backend_syndic.entity.Immeuble;

import com.example.backend_syndic.entity.User;
import com.example.backend_syndic.service.facade.AppartementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AppartementServiceImpl implements AppartementService {

    @Autowired
    private AppartementRepository appartementRepository;

    @Autowired
    private ImmeubleRepository immeubleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.example.backend_syndic.service.facade.ActivityLogService activityLogService;

    // ➕ Ajouter un appartement à un immeuble
    @Override
    public Appartement createAppartement(Long immeubleId, Appartement appartement) {
        Immeuble immeuble = immeubleRepository.findById(immeubleId)
                .orElseThrow(() -> new RuntimeException("Immeuble not found"));

        // 1. Check maximum capacity
        List<Appartement> existingApps = immeuble.getAppartements();
        int currentCount = existingApps != null ? existingApps.size() : 0;
        
        if (immeuble.getNombreAppartementsMax() > 0 && currentCount >= immeuble.getNombreAppartementsMax()) {
            throw new RuntimeException("Capacité maximale de l'immeuble atteinte (" + immeuble.getNombreAppartementsMax() + " appartements)");
        }

        // 2. Validate floor
        if (appartement.getEtage() > immeuble.getNombreEtages()) {
            throw new RuntimeException("L'étage spécifié (" + appartement.getEtage() + ") dépasse le nombre d'étages de l'immeuble (" + immeuble.getNombreEtages() + ")");
        }

        // 3. Auto-generate Number if not provided
        if (appartement.getNumero() == null || appartement.getNumero().isEmpty()) {
            // Logic: [Etage][Index] e.g. Floor 1, 3rd appt -> 103
            long countOnFloor = 0;
            if (existingApps != null) {
                countOnFloor = existingApps.stream()
                        .filter(a -> a.getEtage() == appartement.getEtage())
                        .count();
            }
            String autoNumber = String.format("%d%02d", appartement.getEtage(), countOnFloor + 1);
            appartement.setNumero(autoNumber);
        }

        appartement.setImmeuble(immeuble);
        Appartement saved = appartementRepository.save(appartement);
        
        activityLogService.log("CREATE", "APPARTEMENT", 
            "Création de l'appartement " + saved.getNumero() + " dans l'immeuble " + immeuble.getNom(), 
            "Admin");
            
        return saved;
    }

    // ✏️ Update
    @Override
    public Appartement updateAppartement(Long id, Appartement updated) {
        Appartement existing = appartementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appartement not found"));
        // Preserve existing numero if update payload doesn't provide a new valid one
        if (updated.getNumero() != null && !updated.getNumero().trim().isEmpty()) {
            existing.setNumero(updated.getNumero());
        }
        existing.setEtage(updated.getEtage());
        existing.setSurface(updated.getSurface());
        Appartement saved = appartementRepository.save(existing);

        activityLogService.log("UPDATE", "APPARTEMENT", 
            "Mise à jour de l'appartement " + saved.getNumero() + " (" + saved.getImmeuble().getNom() + ")", 
            "Admin");

        return saved;
    }

    // ❌ Delete
    @Override
    public void deleteAppartement(Long id) {
        Appartement appartement = appartementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appartement not found"));
        String numero = appartement.getNumero();
        String immeubleNom = appartement.getImmeuble() != null ? appartement.getImmeuble().getNom() : "Inconnu";
        
        appartementRepository.delete(appartement);

        activityLogService.log("DELETE", "APPARTEMENT", 
            "Suppression de l'appartement " + numero + " (" + immeubleNom + ")", 
            "Admin");
    }

    // 🔍 Get by id
    @Override
    public Appartement getAppartementById(Long id) {
        return appartementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appartement not found"));
    }

    // 📋 Get all
    @Override
    public List<Appartement> getAllAppartements() {
        return appartementRepository.findAll();
    }

    // 🏠 Get by Immeuble
    @Override
    public List<Appartement> getAppartementsByImmeubleId(Long immeubleId) {
        Immeuble immeuble = immeubleRepository.findById(immeubleId)
                .orElseThrow(() -> new RuntimeException("Immeuble not found"));
        return immeuble.getAppartements();
    }

    @Override
    public Appartement assignProprietaire(Long appartementId, Long proprietaireId) {
            User proprietaire = userRepository.getById(proprietaireId);
        if (proprietaire.getRole() != User.Role.PROPRIETAIRE) {
            throw new RuntimeException("L'utilisateur doit avoir le rôle PROPRIETAIRE");
        }

        Appartement appartement = getAppartementById(appartementId);
        appartement.setProprietaire(proprietaire);
        Appartement saved = appartementRepository.save(appartement);

        activityLogService.log("UPDATE", "APPARTEMENT", 
            "Propriétaire " + proprietaire.getNom() + " assigné à l'appartement " + saved.getNumero(), 
            "Admin");

        return saved;
    }



    @Override
    public Appartement assignLocataire(Long appartementId, Long locataireId) {

        User locataire = userRepository.getById(locataireId);

        if (locataire.getRole() != User.Role.LOCATAIRE) {
            throw new RuntimeException("L'utilisateur doit avoir le rôle LOCATAIRE");
        }

        Appartement appartement = getAppartementById(appartementId);
        appartement.setLocataire(locataire);
        Appartement saved = appartementRepository.save(appartement);

        activityLogService.log("UPDATE", "APPARTEMENT", 
            "Locataire " + locataire.getNom() + " assigné à l'appartement " + saved.getNumero(), 
            "Admin");

        return saved;
    }


    @Override
    public Appartement removeProprietaire(Long appartementId) {
        Appartement appartement = getAppartementById(appartementId);
        appartement.setProprietaire(null);
        return appartementRepository.save(appartement);
    }
    @Override
    public Appartement removeLocataire(Long appartementId) {
        Appartement appartement = getAppartementById(appartementId);
        appartement.setLocataire(null);
        return appartementRepository.save(appartement);
    }



    // 🔢 Calculer surface totale d’un immeuble (optionnel)
    @Override
    public double calculateSurfaceTotaleByImmeuble(Long immeubleId) {
        Immeuble immeuble = immeubleRepository.findById(immeubleId)
                .orElseThrow(() -> new RuntimeException("Immeuble not found"));
        return immeuble.getAppartements().stream()
                .mapToDouble(Appartement::getSurface)
                .sum();
    }
}
