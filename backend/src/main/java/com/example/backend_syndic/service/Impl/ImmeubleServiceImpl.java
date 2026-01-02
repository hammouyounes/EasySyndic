package com.example.backend_syndic.service.Impl;

import com.example.backend_syndic.Dao.ImmeubleRepository;
import com.example.backend_syndic.entity.Appartement;
import com.example.backend_syndic.entity.Immeuble;
import com.example.backend_syndic.service.facade.ImmeubleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ImmeubleServiceImpl implements ImmeubleService {

    @Autowired
    private ImmeubleRepository immeubleRepository;

    @Autowired
    private com.example.backend_syndic.service.facade.ActivityLogService activityLogService;

    // ➕ Create
    @Override
    public Immeuble CreateImmeuble(Immeuble immeuble) {
        Immeuble saved = immeubleRepository.save(immeuble);
        activityLogService.log("CREATE", "IMMEUBLE", 
            "Création de l'immeuble " + saved.getNom(), 
            "Admin");
        return saved;
    }

    // ✏️ Update
    @Override
    public Immeuble updateImmeuble(Long id, Immeuble updatedImmeuble) {
        Immeuble existing = immeubleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Immeuble not found"));

        existing.setNom(updatedImmeuble.getNom());
        existing.setAdress(updatedImmeuble.getAdress());
        existing.setNombreAppartement(updatedImmeuble.getNombreAppartement());
        existing.setNombreEtages(updatedImmeuble.getNombreEtages());
        existing.setNombreAppartementsMax(updatedImmeuble.getNombreAppartementsMax());

        Immeuble saved = immeubleRepository.save(existing);
        activityLogService.log("UPDATE", "IMMEUBLE", 
            "Mise à jour de l'immeuble " + saved.getNom(), 
            "Admin");
        return saved;
    }

    @Override
    public void deleteImmeuble(Long id) {
        Immeuble immeuble = immeubleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Immeuble not found"));
        String nom = immeuble.getNom();
        immeubleRepository.delete(immeuble);
        activityLogService.log("DELETE", "IMMEUBLE", 
            "Suppression de l'immeuble " + nom, 
            "Admin");
    }


    // 📋 Get all
    @Override
    public List<Immeuble> getAllImmeubles() {
        return immeubleRepository.findAll();
    }

    // 🔍 Get by id
    @Override
    public Immeuble getImmeubleById(Long id) {
        return immeubleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Immeuble not found"));
    }

    // 🏠 Appartements par immeuble
    @Override
    public List<Appartement> getAppartementsByImmeuble(Long immeubleId) {
        Immeuble immeuble = getImmeubleById(immeubleId);
        return immeuble.getAppartements();
    }

    // 🔢 Count appartements (optionnel)
    @Override
    public int countAppartementsInImmeuble(Long immeubleId) {
        Immeuble immeuble = getImmeubleById(immeubleId);
        return immeuble.getAppartements() != null
                ? immeuble.getAppartements().size()
                : 0;
    }
}
