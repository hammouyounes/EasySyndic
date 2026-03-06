package com.example.backend_syndic.service.Impl;

import com.example.backend_syndic.Dao.QuittancePDFRepository;
import com.example.backend_syndic.entity.*;
import com.example.backend_syndic.service.facade.QuittancePDFService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Date;

@Service
public class QuittancePDFServiceImpl implements QuittancePDFService {

    @Autowired
    private QuittancePDFRepository repo;

    @Autowired
    private com.example.backend_syndic.Dao.PaiementRepository paiementRepo;

    // ─── SYNDIC INFORMATION (can be externalized to application.properties later)
    // ───
    private static final String SYNDIC_NAME = "EasySyndic Management";
    private static final String SYNDIC_ADDRESS = "123 Boulevard Mohammed V, Casablanca, Maroc";
    private static final String SYNDIC_PHONE = "+212 5 22 00 00 00";
    private static final String SYNDIC_EMAIL = "contact@easysyndic.ma";

    // ─── COLORS ───
    private static final Color PRIMARY_COLOR = new Color(16, 185, 129); // Emerald green
    private static final Color DARK_TEXT = new Color(27, 37, 89); // Dark navy
    private static final Color SECONDARY_TEXT = new Color(107, 114, 128); // Gray-500
    private static final Color LIGHT_BG = new Color(243, 244, 246); // Gray-100
    private static final Color BORDER_COLOR = new Color(229, 231, 235); // Gray-200
    private static final Color WHITE = Color.WHITE;

    @Override
    public QuittancePDF generatePaiementsReportForImmeuble(Long immeubleId) {
        return new QuittancePDF();
    }

    @Override
    public QuittancePDF generateChargesReportForMonth(int month, int year) {
        return new QuittancePDF();
    }

    @Override
    public QuittancePDF generateAppartementSummary(Long appartementId) {
        return new QuittancePDF();
    }

    @Override
    public QuittancePDF generateReçuPaiementPDF(Long paiementId) {
        Paiement paiement = paiementRepo.findById(paiementId).orElse(null);
        if (paiement == null) {
            throw new RuntimeException("Paiement not found with id: " + paiementId);
        }

        QuittancePDF pdf = new QuittancePDF();
        String fileName = "recu_paiement_" + paiementId + ".pdf";
        String filePath = "generated_pdfs/" + fileName;

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();
            float margin = 50;
            float contentWidth = pageWidth - 2 * margin;
            float yPos = pageHeight - margin;

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {

                // ══════════════════════════════════════════════════════════════
                // 1. HEADER — Green banner with syndic name
                // ══════════════════════════════════════════════════════════════
                float headerHeight = 80;
                cs.setNonStrokingColor(PRIMARY_COLOR);
                cs.addRect(0, pageHeight - headerHeight, pageWidth, headerHeight);
                cs.fill();

                // Syndic name in white
                cs.setNonStrokingColor(WHITE);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 22);
                cs.beginText();
                cs.newLineAtOffset(margin, pageHeight - 35);
                cs.showText(SYNDIC_NAME);
                cs.endText();

                // Subtitle
                cs.setFont(PDType1Font.HELVETICA, 10);
                cs.beginText();
                cs.newLineAtOffset(margin, pageHeight - 52);
                cs.showText(SYNDIC_ADDRESS);
                cs.endText();

                cs.beginText();
                cs.newLineAtOffset(margin, pageHeight - 65);
                cs.showText("Tel: " + SYNDIC_PHONE + "  |  Email: " + SYNDIC_EMAIL);
                cs.endText();

                yPos = pageHeight - headerHeight - 30;

                // ══════════════════════════════════════════════════════════════
                // 2. TITLE — "QUITTANCE DE PAIEMENT"
                // ══════════════════════════════════════════════════════════════
                cs.setNonStrokingColor(DARK_TEXT);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 20);
                String title = "QUITTANCE DE PAIEMENT";
                float titleWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(title) / 1000 * 20;
                cs.beginText();
                cs.newLineAtOffset((pageWidth - titleWidth) / 2, yPos);
                cs.showText(title);
                cs.endText();

                yPos -= 10;

                // Decorative line under title
                cs.setStrokingColor(PRIMARY_COLOR);
                cs.setLineWidth(2);
                cs.moveTo((pageWidth - titleWidth) / 2, yPos);
                cs.lineTo((pageWidth + titleWidth) / 2, yPos);
                cs.stroke();

                yPos -= 15;

                // Reference number, right-aligned
                String reference = paiement.getReference() != null ? paiement.getReference() : "PAY-" + paiementId;
                cs.setFont(PDType1Font.HELVETICA, 10);
                cs.setNonStrokingColor(SECONDARY_TEXT);
                String refText = "Ref: " + reference;
                float refWidth = PDType1Font.HELVETICA.getStringWidth(refText) / 1000 * 10;
                cs.beginText();
                cs.newLineAtOffset(pageWidth - margin - refWidth, yPos);
                cs.showText(refText);
                cs.endText();

                // Generation date, left-aligned
                SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm");
                String genDate = "Date d'emission: " + sdf.format(new Date());
                cs.beginText();
                cs.newLineAtOffset(margin, yPos);
                cs.showText(genDate);
                cs.endText();

                yPos -= 30;

                // ══════════════════════════════════════════════════════════════
                // 3. TWO-COLUMN INFO: Owner + Building
                // ══════════════════════════════════════════════════════════════
                float colWidth = (contentWidth - 20) / 2;
                float boxHeight = 95;

                // --- LEFT BOX: Owner Info ---
                drawInfoBox(cs, margin, yPos - boxHeight, colWidth, boxHeight,
                        "INFORMATIONS DU PROPRIETAIRE",
                        new String[] {
                                "Nom: " + safeUserName(paiement.getUser()),
                                "Email: " + safeUserEmail(paiement.getUser()),
                                "Appartement: " + safeAppartementNumero(paiement.getAppartement()),
                                "Etage: " + safeAppartementEtage(paiement.getAppartement())
                        });

                // --- RIGHT BOX: Building Info ---
                float rightBoxX = margin + colWidth + 20;
                drawInfoBox(cs, rightBoxX, yPos - boxHeight, colWidth, boxHeight,
                        "INFORMATIONS DE L'IMMEUBLE",
                        new String[] {
                                "Immeuble: " + safeImmeubleName(paiement.getAppartement()),
                                "Adresse: " + safeImmeubleAddress(paiement.getAppartement()),
                                "Nb. Etages: " + safeImmeubleEtages(paiement.getAppartement()),
                                ""
                        });

                yPos -= boxHeight + 30;

                // ══════════════════════════════════════════════════════════════
                // 4. PAYMENT DETAILS TABLE
                // ══════════════════════════════════════════════════════════════
                cs.setNonStrokingColor(PRIMARY_COLOR);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 12);
                cs.beginText();
                cs.newLineAtOffset(margin, yPos);
                cs.showText("DETAILS DU PAIEMENT");
                cs.endText();

                yPos -= 8;

                // Decorative line
                cs.setStrokingColor(PRIMARY_COLOR);
                cs.setLineWidth(1.5f);
                cs.moveTo(margin, yPos);
                cs.lineTo(margin + contentWidth, yPos);
                cs.stroke();

                yPos -= 5;

                // Table header
                float tableY = yPos;
                float rowHeight = 28;
                float col1Width = contentWidth * 0.45f;
                float col2Width = contentWidth * 0.55f;

                // Header row background
                cs.setNonStrokingColor(DARK_TEXT);
                cs.addRect(margin, tableY - rowHeight, contentWidth, rowHeight);
                cs.fill();

                // Header text
                cs.setNonStrokingColor(WHITE);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 10);
                cs.beginText();
                cs.newLineAtOffset(margin + 10, tableY - 18);
                cs.showText("DESCRIPTION");
                cs.endText();
                cs.beginText();
                cs.newLineAtOffset(margin + col1Width + 10, tableY - 18);
                cs.showText("VALEUR");
                cs.endText();

                tableY -= rowHeight;

                // Table rows
                String paymentDate = paiement.getDatePaiement() != null
                        ? paiement.getDatePaiement().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"))
                        : "N/A";
                String paymentMode = paiement.getModePaiement() != null ? paiement.getModePaiement() : "N/A";
                String chargeType = safeChargeType(paiement.getAppelCharge());
                String period = safeChargePeriod(paiement.getAppelCharge());
                String status = safePaymentStatus(paiement.getAppelCharge());

                String[][] rows = {
                        { "Numero de Reference", reference },
                        { "Date de Paiement", paymentDate },
                        { "Mode de Paiement", paymentMode },
                        { "Type de Charge", chargeType },
                        { "Periode Concernee", period },
                        { "Statut du Paiement", status },
                };

                boolean alternate = false;
                for (String[] row : rows) {
                    // Alternate row background
                    if (alternate) {
                        cs.setNonStrokingColor(LIGHT_BG);
                        cs.addRect(margin, tableY - rowHeight, contentWidth, rowHeight);
                        cs.fill();
                    }
                    alternate = !alternate;

                    // Row border
                    cs.setStrokingColor(BORDER_COLOR);
                    cs.setLineWidth(0.5f);
                    cs.moveTo(margin, tableY - rowHeight);
                    cs.lineTo(margin + contentWidth, tableY - rowHeight);
                    cs.stroke();

                    // Row text
                    cs.setNonStrokingColor(SECONDARY_TEXT);
                    cs.setFont(PDType1Font.HELVETICA, 10);
                    cs.beginText();
                    cs.newLineAtOffset(margin + 10, tableY - 18);
                    cs.showText(row[0]);
                    cs.endText();

                    cs.setNonStrokingColor(DARK_TEXT);
                    cs.setFont(PDType1Font.HELVETICA_BOLD, 10);
                    cs.beginText();
                    cs.newLineAtOffset(margin + col1Width + 10, tableY - 18);
                    cs.showText(row[1]);
                    cs.endText();

                    tableY -= rowHeight;
                }

                // ══════════════════════════════════════════════════════════════
                // 5. AMOUNT — Big highlighted box
                // ══════════════════════════════════════════════════════════════
                tableY -= 15;
                float amountBoxHeight = 50;

                // Green background box
                cs.setNonStrokingColor(PRIMARY_COLOR);
                cs.addRect(margin, tableY - amountBoxHeight, contentWidth, amountBoxHeight);
                cs.fill();

                // Amount label
                cs.setNonStrokingColor(WHITE);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 14);
                cs.beginText();
                cs.newLineAtOffset(margin + 15, tableY - 32);
                cs.showText("MONTANT TOTAL");
                cs.endText();

                // Amount value
                String amountStr = String.format("%.2f MAD", paiement.getMontant());
                float amountWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(amountStr) / 1000 * 18;
                cs.setFont(PDType1Font.HELVETICA_BOLD, 18);
                cs.beginText();
                cs.newLineAtOffset(margin + contentWidth - amountWidth - 15, tableY - 34);
                cs.showText(amountStr);
                cs.endText();

                tableY -= amountBoxHeight + 40;

                // ══════════════════════════════════════════════════════════════
                // 6. SIGNATURE SECTION
                // ══════════════════════════════════════════════════════════════
                // Left — Owner signature area
                cs.setNonStrokingColor(SECONDARY_TEXT);
                cs.setFont(PDType1Font.HELVETICA, 10);
                cs.beginText();
                cs.newLineAtOffset(margin, tableY);
                cs.showText("Signature du Proprietaire:");
                cs.endText();

                cs.setStrokingColor(BORDER_COLOR);
                cs.setLineWidth(1);
                cs.moveTo(margin, tableY - 40);
                cs.lineTo(margin + colWidth - 20, tableY - 40);
                cs.stroke();

                // Right — Syndic stamp area
                cs.beginText();
                cs.newLineAtOffset(rightBoxX, tableY);
                cs.showText("Cachet et Signature du Syndic:");
                cs.endText();

                cs.moveTo(rightBoxX, tableY - 40);
                cs.lineTo(rightBoxX + colWidth - 20, tableY - 40);
                cs.stroke();

                // ══════════════════════════════════════════════════════════════
                // 7. FOOTER
                // ══════════════════════════════════════════════════════════════
                float footerY = 45;

                // Horizontal line
                cs.setStrokingColor(PRIMARY_COLOR);
                cs.setLineWidth(1);
                cs.moveTo(margin, footerY + 15);
                cs.lineTo(pageWidth - margin, footerY + 15);
                cs.stroke();

                cs.setNonStrokingColor(SECONDARY_TEXT);
                cs.setFont(PDType1Font.HELVETICA, 8);

                String footerLine1 = SYNDIC_NAME + " - " + SYNDIC_ADDRESS;
                float f1Width = PDType1Font.HELVETICA.getStringWidth(footerLine1) / 1000 * 8;
                cs.beginText();
                cs.newLineAtOffset((pageWidth - f1Width) / 2, footerY);
                cs.showText(footerLine1);
                cs.endText();

                String footerLine2 = "Ce document est une quittance officielle generee electroniquement. Il fait foi de paiement.";
                float f2Width = PDType1Font.HELVETICA.getStringWidth(footerLine2) / 1000 * 8;
                cs.beginText();
                cs.newLineAtOffset((pageWidth - f2Width) / 2, footerY - 12);
                cs.showText(footerLine2);
                cs.endText();
            }

            // Save file
            File file = new File(filePath);
            file.getParentFile().mkdirs();
            document.save(file);

            pdf.setCheminFichier(filePath);
            pdf.setDateCreation(new Date());
            pdf.setPaiement(paiement);

        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }

        return repo.save(pdf);
    }

    // ─── HELPER: Draw a rounded info box with title + lines ───
    private void drawInfoBox(PDPageContentStream cs, float x, float y, float width, float height,
            String title, String[] lines) throws IOException {
        // Box background
        cs.setNonStrokingColor(LIGHT_BG);
        cs.addRect(x, y, width, height);
        cs.fill();

        // Left border accent
        cs.setNonStrokingColor(PRIMARY_COLOR);
        cs.addRect(x, y, 3, height);
        cs.fill();

        // Title
        cs.setNonStrokingColor(PRIMARY_COLOR);
        cs.setFont(PDType1Font.HELVETICA_BOLD, 9);
        cs.beginText();
        cs.newLineAtOffset(x + 12, y + height - 16);
        cs.showText(title);
        cs.endText();

        // Content lines
        cs.setNonStrokingColor(DARK_TEXT);
        cs.setFont(PDType1Font.HELVETICA, 10);
        float lineY = y + height - 34;
        for (String line : lines) {
            if (line != null && !line.isEmpty()) {
                cs.beginText();
                cs.newLineAtOffset(x + 12, lineY);
                cs.showText(line);
                cs.endText();
            }
            lineY -= 17;
        }
    }

    // ─── SAFE GETTERS (null-proof) ───

    private String safeUserName(User user) {
        if (user == null)
            return "N/A";
        String nom = user.getNom() != null ? user.getNom() : "";
        String prenom = user.getPrenom() != null ? user.getPrenom() : "";
        String full = (prenom + " " + nom).trim();
        return full.isEmpty() ? "N/A" : full;
    }

    private String safeUserEmail(User user) {
        return user != null && user.getEmail() != null ? user.getEmail() : "N/A";
    }

    private String safeAppartementNumero(Appartement appt) {
        return appt != null && appt.getNumero() != null ? appt.getNumero() : "N/A";
    }

    private String safeAppartementEtage(Appartement appt) {
        if (appt == null || appt.getEtage() == null)
            return "N/A";
        return appt.getEtage() == 0 ? "RDC" : appt.getEtage() + " eme";
    }

    private String safeImmeubleName(Appartement appt) {
        if (appt == null || appt.getImmeuble() == null)
            return "N/A";
        return appt.getImmeuble().getNom() != null ? appt.getImmeuble().getNom() : "N/A";
    }

    private String safeImmeubleAddress(Appartement appt) {
        if (appt == null || appt.getImmeuble() == null)
            return "N/A";
        return appt.getImmeuble().getAdress() != null ? appt.getImmeuble().getAdress() : "N/A";
    }

    private String safeImmeubleEtages(Appartement appt) {
        if (appt == null || appt.getImmeuble() == null)
            return "N/A";
        return String.valueOf(appt.getImmeuble().getNombreEtages());
    }

    private String safeChargeType(AppelCharge ac) {
        if (ac == null || ac.getCharge() == null)
            return "Charges de Syndic";
        String type = ac.getCharge().getType();
        return type != null ? type : "Charges de Syndic";
    }

    private String safeChargePeriod(AppelCharge ac) {
        if (ac == null || ac.getDateEmission() == null)
            return "N/A";
        SimpleDateFormat sdf = new SimpleDateFormat("MMMM yyyy");
        return sdf.format(ac.getDateEmission());
    }

    private String safePaymentStatus(AppelCharge ac) {
        if (ac == null || ac.getStatus() == null)
            return "PAYE";
        return ac.getStatus().getLabel() != null ? ac.getStatus().getLabel() : "PAYE";
    }
}
