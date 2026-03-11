package com.example.backend_syndic.service.facade;


public interface NotificationService {

    // Rappel de paiement
    void sendPaymentReminder(Long userId, String message);

    // Confirmation de paiement
    void sendPaymentConfirmation(Long userId, String message);

    // Nouvelle charge
    void notifyNewCharge(Long userId, String message);

    // Nouvel utilisateur (credentials)
    void notifyNewUserCredentials(Long userId, String message);

    // Message personnalisé
    void sendCustomMessage(Long userId, String message);

    // Envoi d'email à un propriétaire (avec validation active + role)
    void sendToOwner(String targetEmail, String subject, String body);
}
