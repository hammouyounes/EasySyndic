package com.example.backend_syndic.ws;

import com.example.backend_syndic.dto.MailRequest;
import com.example.backend_syndic.service.facade.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
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

    // 🆕 Création d'un compte utilisateur
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

    // ✉️ Envoi d'email à un propriétaire (charge notification)
    // POST /api/notifications/send-to-owner
    @PostMapping("/send-to-owner")
    public ResponseEntity<Map<String, String>> sendToOwner(@RequestBody MailRequest request) {
        try {
            notificationService.sendToOwner(
                    request.getTargetEmail(),
                    request.getSubject(),
                    request.getBody()
            );
            return ResponseEntity.ok(Map.of("message", "Email envoyé avec succès à " + request.getTargetEmail()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}

