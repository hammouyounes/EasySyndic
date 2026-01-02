package com.example.backend_syndic.service.Impl;

import com.example.backend_syndic.Dao.QuittancePDFRepository;
import com.example.backend_syndic.entity.QuittancePDF;
import com.example.backend_syndic.service.facade.QuittancePDFService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class QuittancePDFServiceImpl implements QuittancePDFService {

    @Autowired
    private QuittancePDFRepository repo;
    
    @Autowired
    private com.example.backend_syndic.Dao.PaiementRepository paiementRepo; // Need to fetch payment details

    @Override
    public QuittancePDF generatePaiementsReportForImmeuble(Long immeubleId) {
        // Implement report logic if needed
        return new QuittancePDF(); 
    }

    @Override
    public QuittancePDF generateChargesReportForMonth(int month, int year) {
        // Implement report logic if needed
        return new QuittancePDF(); 
    }

    @Override
    public QuittancePDF generateAppartementSummary(Long appartementId) {
        // Implement report logic if needed
        return new QuittancePDF(); 
    }

    @Override
    public QuittancePDF generateReçuPaiementPDF(Long paiementId) {
        com.example.backend_syndic.entity.Paiement paiement = paiementRepo.findById(paiementId).orElse(null);
        if (paiement == null) {
            throw new RuntimeException("Paiement not found with id: " + paiementId);
        }

        QuittancePDF pdf = new QuittancePDF();
        String fileName = "recu_paiement_" + paiementId + ".pdf";
        String filePath = "generated_pdfs/" + fileName;
        
        try (org.apache.pdfbox.pdmodel.PDDocument document = new org.apache.pdfbox.pdmodel.PDDocument()) {
            org.apache.pdfbox.pdmodel.PDPage page = new org.apache.pdfbox.pdmodel.PDPage();
            document.addPage(page);

            try (org.apache.pdfbox.pdmodel.PDPageContentStream contentStream = new org.apache.pdfbox.pdmodel.PDPageContentStream(document, page)) {
                // Title
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA_BOLD, 16);
                contentStream.beginText();
                contentStream.newLineAtOffset(100, 700);
                contentStream.showText("QUITTANCE DE PAIEMENT");
                contentStream.endText();
                
                // Payment details
                contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(100, 650);
                
                // Reference
                String reference = paiement.getReference() != null ? paiement.getReference() : "N/A";
                contentStream.showText("Reference: " + reference);
                contentStream.newLineAtOffset(0, -25);
                
                // Date
                String date = paiement.getDatePaiement() != null ? paiement.getDatePaiement().toString() : "N/A";
                contentStream.showText("Date: " + date);
                contentStream.newLineAtOffset(0, -25);
                
                // Amount
                contentStream.showText("Montant: " + paiement.getMontant() + " DH");
                contentStream.newLineAtOffset(0, -25);
                
                // Payment mode
                String mode = paiement.getModePaiement() != null ? paiement.getModePaiement() : "N/A";
                contentStream.showText("Mode de paiement: " + mode);
                contentStream.newLineAtOffset(0, -25);
                
                // Apartment info
                if (paiement.getAppartement() != null) {
                    contentStream.showText("Appartement: " + paiement.getAppartement().getNumero());
                    contentStream.newLineAtOffset(0, -25);
                    
                    if (paiement.getAppartement().getImmeuble() != null) {
                        contentStream.showText("Immeuble: " + paiement.getAppartement().getImmeuble().getNom());
                        contentStream.newLineAtOffset(0, -25);
                    }
                }
                
                // User info
                if (paiement.getUser() != null) {
                    String userName = paiement.getUser().getNom() + " " + 
                                    (paiement.getUser().getPrenom() != null ? paiement.getUser().getPrenom() : "");
                    contentStream.showText("Paye par: " + userName);
                }
                
                contentStream.endText();
            }

            java.io.File file = new java.io.File(filePath);
            file.getParentFile().mkdirs();
            document.save(file);
            
            pdf.setCheminFichier(filePath);
            pdf.setDateCreation(new Date());
            pdf.setPaiement(paiement);
            
        } catch (java.io.IOException e) {
            e.printStackTrace();
            throw new RuntimeException("Error generating PDF: " + e.getMessage(), e);
        }

        return repo.save(pdf);
    }

}
