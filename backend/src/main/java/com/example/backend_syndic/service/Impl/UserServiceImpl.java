package com.example.backend_syndic.service.Impl;

import com.example.backend_syndic.Dao.AppartementRepository;
import com.example.backend_syndic.Dao.AppelChargeRepository;
import com.example.backend_syndic.Dao.PaiementRepository;
import com.example.backend_syndic.Dao.UserRepository;
import com.example.backend_syndic.entity.User;
import com.example.backend_syndic.service.facade.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private AppartementRepository appartementRepository;

    @Autowired
    private AppelChargeRepository appelChargeRepository;

    @Autowired
    private PaiementRepository paiementRepository;

    @Autowired
    private com.example.backend_syndic.service.facade.ActivityLogService activityLogService;

    // ➕ Create
    @Override
    public User createUtilisateur(User user) {
        User saved = repo.save(user);
        activityLogService.log("CREATE", "USER", 
            "Création de l'utilisateur " + saved.getNom() + " " + saved.getPrenom() + " (" + saved.getRole() + ")", 
            "Admin");
        return saved;
    }

    // ✏️ Update
    @Override
    public User updateUtilisateur(Long id, User updatedUser) {
        User existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur not found"));
        existing.setNom(updatedUser.getNom());
        existing.setPrenom(updatedUser.getPrenom());
        existing.setEmail(updatedUser.getEmail());
        User saved = repo.save(existing);
        activityLogService.log("UPDATE", "USER", 
            "Mise à jour de l'utilisateur " + saved.getNom() + " " + saved.getPrenom(), 
            "Admin");
        return saved;
    }

    // ❌ Delete
    @Override
    public void deleteUtilisateur(Long id) {
        User existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur not found"));
        String name = existing.getNom() + " " + existing.getPrenom();
        repo.delete(existing);
        activityLogService.log("DELETE", "USER", 
            "Suppression de l'utilisateur " + name, 
            "Admin");
    }

    // 🔍 Get by id
    @Override
    public User getUtilisateurById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur not found"));
    }

    // 📋 Get all
    @Override
    public List<User> getAllUtilisateurs() {
        List<User> users = repo.findAll();
        for (User user : users) {
             boolean isOwner = appartementRepository.existsByProprietaireId(user.getId());
             boolean hasPayments = paiementRepository.existsByUserId(user.getId());
             
             // Allow toggle only if NOT an owner AND has no associated payments
             user.setCanToggleStatus(!isOwner && !hasPayments);
        }
        return users;
    }

    // 🔹 Propriétaires
    @Override
    public List<User> getProprietaires() {
        return repo.findAll().stream()
                .filter(u -> u.getRole() == User.Role.PROPRIETAIRE)
                .collect(Collectors.toList());
    }

    // 🔹 Locataires
    @Override
    public List<User> getLocataires() {
        return repo.findAll().stream()
                .filter(u -> u.getRole() == User.Role.LOCATAIRE)
                .collect(Collectors.toList());
    }

    // 🔑 Login simple
    @Override
    public User login(String email, String motDePasse) {
        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));
        if(!user.getMotDePasse().equals(motDePasse)) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }
        if (!Boolean.TRUE.equals(user.getActive())) {
             throw new RuntimeException("Votre compte est désactivé. Veuillez contacter l'administrateur.");
        }
        return user;
    }

    // 🔄 Change password
    @Override
    public User changePassword(Long id, String newPassword) {
        User user = getUtilisateurById(id);
        user.setMotDePasse(newPassword);
        return repo.save(user);
    }

    // 🔧 Assign role
    @Override
    public User assignRole(Long id, User.Role role) {
        User user = getUtilisateurById(id);
        user.setRole(role);
        return repo.save(user);
    }

    // 🔄 Activer/Désactiver
    @Override
    public User toggleStatus(Long id) {
        User user = getUtilisateurById(id);
        user.setActive(!user.getActive());
        User saved = repo.save(user);
        activityLogService.log("UPDATE", "USER", 
            (saved.getActive() ? "Activation" : "Désactivation") + " de l'utilisateur " + saved.getNom(), 
            "Admin");
        return saved;
    }
}
