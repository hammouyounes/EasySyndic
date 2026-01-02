package com.example.backend_syndic.service.facade;

import com.example.backend_syndic.entity.User;

import java.util.List;

public interface UserService {

    // ➕ Ajouter un utilisateur
    User createUtilisateur(User user);

    // ✏️ Modifier un utilisateur
    User updateUtilisateur(Long id, User updatedUser);

    // ❌ Supprimer un utilisateur
    void deleteUtilisateur(Long id);

    // 🔍 Retourner un utilisateur par id
    User getUtilisateurById(Long id);

    // 📋 Retourner tous les utilisateurs
    List<User> getAllUtilisateurs();

    // 🔹 Retourner uniquement les propriétaires
    List<User> getProprietaires();

    // 🔹 Retourner uniquement les locataires
    List<User> getLocataires();

    // 🔑 Authentification simple (email + motDePasse)
    User login(String email, String motDePasse);

    // 🔄 Changer mot de passe
    User changePassword(Long id, String newPassword);

    // 🔧 Changer rôle
    User assignRole(Long id, User.Role role);
}
