package com.example.backend_syndic.service.Impl;

import com.example.backend_syndic.entity.AppelCharge;
import com.example.backend_syndic.entity.Appartement;
import com.example.backend_syndic.entity.Charge;
import com.example.backend_syndic.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ChargeEmailService {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private JavaMailSender mailSender;

    /**
     * Asynchronously generates AI-powered Arabic emails and sends them
     * to all proprietaires affected by the charge distribution.
     * 
     * This method runs on a separate thread pool so the UI doesn't freeze.
     */
    @Async("emailTaskExecutor")
    public void sendDistributionEmails(List<AppelCharge> appelCharges, Charge charge) {
        System.out.println("🚀 [ASYNC] Starting AI email generation for charge: " + charge.getType());

        // Track already-emailed proprietaires to avoid duplicates
        // (one proprietaire may own multiple apartments in the same building)
        Set<Long> emailedProprietaireIds = new HashSet<>();

        for (AppelCharge appel : appelCharges) {
            try {
                Appartement appartement = appel.getAppartement();
                if (appartement == null) continue;

                User proprietaire = appartement.getProprietaire();
                if (proprietaire == null) continue;
                if (proprietaire.getEmail() == null || proprietaire.getEmail().isBlank()) continue;
                if (!Boolean.TRUE.equals(proprietaire.getActive())) continue;

                // Skip if already emailed this proprietaire for this charge
                if (emailedProprietaireIds.contains(proprietaire.getId())) {
                    System.out.println("⏭️ Skipping duplicate email for: " + proprietaire.getEmail());
                    continue;
                }

                String ownerName = (proprietaire.getPrenom() != null ? proprietaire.getPrenom() : "") 
                                 + " " 
                                 + (proprietaire.getNom() != null ? proprietaire.getNom() : "");
                ownerName = ownerName.trim();

                // Generate AI email body (with automatic fallback)
                String emailBody = geminiService.generateChargeEmail(
                    ownerName,
                    charge.getType(),
                    appel.getTotal(),
                    charge.getPeriode()
                );

                // Send the email via SMTP
                sendHtmlEmail(
                    proprietaire.getEmail(),
                    "إشعار بمستحقات جديدة - " + charge.getType(),
                    emailBody
                );

                emailedProprietaireIds.add(proprietaire.getId());

                System.out.println("✅ Email sent to " + proprietaire.getEmail() 
                    + " for charge: " + charge.getType() 
                    + " | Amount: " + appel.getTotal() + " MAD");

                // Small delay to avoid rate-limiting from Gmail SMTP
                Thread.sleep(1000);

            } catch (Exception e) {
                System.err.println("❌ Error sending email for AppelCharge ID " 
                    + appel.getId() + ": " + e.getMessage());
                // Continue to next - don't let one failure stop all emails
            }
        }

        System.out.println("🏁 [ASYNC] Finished sending " + emailedProprietaireIds.size() 
            + " AI-generated emails for charge: " + charge.getType());
    }

    private void sendHtmlEmail(String to, String subject, String body) throws Exception {
        MimeMessage mimeMessage = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "utf-8");
        helper.setTo(to);
        helper.setSubject(subject);
        // Set as plain text (Arabic content from AI)
        helper.setText(body, false);
        helper.setFrom("eloddysaadeddine@gmail.com");
        mailSender.send(mimeMessage);
    }
}
