package com.example.backend_syndic.ws;

import com.example.backend_syndic.service.facade.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // 🔔 Rappel de paiement
    // POST /api/notifications/payment-reminder/{userId}
    @PostMapping("/payment-reminder/{userId}")
    public void sendPaymentReminder(
            @PathVariable Long userId,
            @RequestBody String message
    ) {
        notificationService.sendPaymentReminder(userId, message);
    }

    // ✅ Confirmation de paiement
    // POST /api/notifications/payment-confirmation/{userId}
    @PostMapping("/payment-confirmation/{userId}")
    public void sendPaymentConfirmation(
            @PathVariable Long userId,
            @RequestBody String message
    ) {
        notificationService.sendPaymentConfirmation(userId, message);
    }

    // 🧾 Nouvelle charge
    // POST /api/notifications/new-charge/{userId}
    @PostMapping("/new-charge/{userId}")
    public void notifyNewCharge(
            @PathVariable Long userId,
            @RequestBody String message
    ) {
        notificationService.notifyNewCharge(userId, message);
    }

    // 🆕 Création d’un compte utilisateur
    // POST /api/notifications/new-user/{userId}
    @PostMapping("/new-user/{userId}")
    public void notifyNewUserCredentials(
            @PathVariable Long userId,
            @RequestBody String message
    ) {
        notificationService.notifyNewUserCredentials(userId, message);
    }

    // ✉️ Message personnalisé
    // POST /api/notifications/custom/{userId}
    @PostMapping("/custom/{userId}")
    public void sendCustomMessage(
            @PathVariable Long userId,
            @RequestBody String message
    ) {
        notificationService.sendCustomMessage(userId, message);
    }
}
