package com.example.backend_syndic.service.Impl;

import com.example.backend_syndic.Dao.NotificationRepesitory;
import com.example.backend_syndic.entity.Notification;
import com.example.backend_syndic.entity.User;
import com.example.backend_syndic.service.facade.NotificationService;
import com.example.backend_syndic.Dao.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepesitory notificationRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    private void sendEmail(User user, String subject, String messageText) {
        try {
            org.springframework.mail.SimpleMailMessage message = new org.springframework.mail.SimpleMailMessage();
            if (user.getEmail() == null || user.getEmail().isEmpty()) {
                System.err.println("User " + user.getId() + " has no email address.");
                return;
            }
            message.setTo(user.getEmail());
            message.setSubject(subject);
            message.setText(messageText);
            mailSender.send(message);

            Notification notif = new Notification();
            notif.setUser(user);
            notif.setEmail(user.getEmail());
            notif.setType(subject);
            notif.setDateEnvoi(new Date());
            notificationRepo.save(notif);

            System.out.println("Email sent to " + user.getEmail() + " : " + subject);
        } catch (Exception e) {
            System.err.println("Failed to send email to " + user.getEmail() + ": " + e.getMessage());
        }
    }

    @Override
    public void sendPaymentReminder(Long userId, String message) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        sendEmail(user, "Payment Reminder", message);
    }

    @Override
    public void sendPaymentConfirmation(Long userId, String message) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        sendEmail(user, "Payment Confirmation", message);
    }

    @Override
    public void notifyNewCharge(Long userId, String message) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        sendEmail(user, "New Charge", message);
    }

    @Override
    public void notifyNewUserCredentials(Long userId, String message) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        sendEmail(user, "New User Credentials", message);
    }

    @Override
    public void sendCustomMessage(Long userId, String message) {
        User user = userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        sendEmail(user, "Custom Message", message);
    }

    @Override
    public void sendToOwner(String targetEmail, String subject, String body) {
        // Validate: only send to active PROPRIETAIRE
        User user = userRepo.findByEmail(targetEmail)
                .orElseThrow(() -> new RuntimeException("Aucun utilisateur trouvé avec cet email: " + targetEmail));

        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new RuntimeException("L'utilisateur n'est pas actif.");
        }
        if (user.getRole() != User.Role.PROPRIETAIRE) {
            throw new RuntimeException("L'utilisateur n'est pas un propriétaire.");
        }

        try {
            jakarta.mail.internet.MimeMessage mimeMessage = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper =
                    new org.springframework.mail.javamail.MimeMessageHelper(mimeMessage, "utf-8");
            helper.setTo(targetEmail);
            helper.setSubject(subject);
            helper.setText(body, false);
            helper.setFrom("younesshamou013@gmail.com");
            mailSender.send(mimeMessage);

            // Log notification in DB
            Notification notif = new Notification();
            notif.setUser(user);
            notif.setEmail(targetEmail);
            notif.setType(subject);
            notif.setDateEnvoi(new Date());
            notificationRepo.save(notif);

            System.out.println("Email envoyé à " + targetEmail + " : " + subject);
        } catch (Exception e) {
            System.err.println("Échec d'envoi à " + targetEmail + ": " + e.getMessage());
            throw new RuntimeException("Échec d'envoi de l'email: " + e.getMessage());
        }
    }
}
