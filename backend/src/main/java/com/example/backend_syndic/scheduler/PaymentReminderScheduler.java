package com.example.backend_syndic.scheduler;

import com.example.backend_syndic.Dao.AppelChargeRepository;
import com.example.backend_syndic.entity.AppelCharge;
import com.example.backend_syndic.entity.User;
import com.example.backend_syndic.service.Impl.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Component
public class PaymentReminderScheduler {

    @Autowired
    private AppelChargeRepository appelChargeRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private GeminiService geminiService;

    /**
     * Runs every day at 8:00 AM to check for late payments.
     * Logic: If dateEmission is > 30 days ago AND status is not 'PAYÉ' AND reminderSent is false.
     */
    @Scheduled(cron = "0 0 8 * * ?") 
    //@Scheduled(fixedRate = 60000) // For testing: runs every minute
    public void sendLatePaymentReminders() {
        System.out.println("⏰ [SCHEDULER] Checking for late payment reminders...");

        // Calculate the threshold date (30 days ago)
        LocalDateTime threshold = LocalDateTime.now().minusDays(30);
        Date thresholdDate = Date.from(threshold.atZone(ZoneId.systemDefault()).toInstant());

        // Find late charges that haven't been replied to yet
        // We filter by status label != "PAYÉ" and dateEmission < thresholdDate and reminderSent = false
        List<AppelCharge> lateCharges = appelChargeRepository.findAll().stream()
                .filter(ac -> ac.getStatus() != null && !"PAYÉ".equals(ac.getStatus().getLabel()))
                .filter(ac -> ac.getDateEmission() != null && ac.getDateEmission().before(thresholdDate))
                .filter(ac -> ac.getReminderSent() == null || !ac.getReminderSent())
                .toList();

        System.out.println("🔍 Found " + lateCharges.size() + " late charges requiring reminders.");

        for (AppelCharge appel : lateCharges) {
            try {
                User proprietaire = appel.getAppartement().getProprietaire();
                if (proprietaire == null || proprietaire.getEmail() == null || proprietaire.getEmail().isBlank()) continue;

                String ownerName = (proprietaire.getPrenom() != null ? proprietaire.getPrenom() : "") 
                                 + " " 
                                 + (proprietaire.getNom() != null ? proprietaire.getNom() : "");

                // Generate AI reminder body (Arabic)
                String emailBody = geminiService.generateLatePaymentReminder(
                    ownerName.trim(),
                    appel.getCharge().getType(),
                    appel.getTotal(),
                    appel.getCharge().getPeriode()
                );

                sendHtmlEmail(
                    proprietaire.getEmail(),
                    "تذكير بالأداء: مستحقات متأخرة - " + appel.getCharge().getType(),
                    emailBody
                );

                // Mark as sent
                appel.setReminderSent(true);
                appelChargeRepository.save(appel);

                System.out.println("📧 Reminder sent to " + proprietaire.getEmail() + " for charge ID " + appel.getId());

                // Rate limiting
                Thread.sleep(1000);

            } catch (Exception e) {
                System.err.println("❌ Failed to send reminder for charge ID " + appel.getId() + ": " + e.getMessage());
            }
        }
    }

    private void sendHtmlEmail(String to, String subject, String body) throws Exception {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(body, false);
        helper.setFrom("eloddysaadeddine@gmail.com");
        mailSender.send(mimeMessage);
    }
}
