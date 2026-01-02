package com.example.backend_syndic.ws;

import com.example.backend_syndic.entity.QuittancePDF;
import com.example.backend_syndic.service.facade.QuittancePDFService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

@RestController
@RequestMapping("/api/quittances")
public class QuittancePDFController {

    @Autowired
    private QuittancePDFService quittancePDFService;

    // 📄 PDF des paiements d’un immeuble
    // GET /api/quittances/immeuble/{immeubleId}/paiements
    @GetMapping("/immeuble/{immeubleId}/paiements")
    public QuittancePDF generatePaiementsReportForImmeuble(
            @PathVariable Long immeubleId
    ) {
        return quittancePDFService.generatePaiementsReportForImmeuble(immeubleId);
    }

    // 📆 PDF des charges par mois
    // GET /api/quittances/charges?month=5&year=2025
    @GetMapping("/charges")
    public QuittancePDF generateChargesReportForMonth(
            @RequestParam int month,
            @RequestParam int year
    ) {
        return quittancePDFService.generateChargesReportForMonth(month, year);
    }

    // 🏠 PDF récapitulatif d’un appartement
    // GET /api/quittances/appartement/{appartementId}
    @GetMapping("/appartement/{appartementId}")
    public QuittancePDF generateAppartementSummary(
            @PathVariable Long appartementId
    ) {
        return quittancePDFService.generateAppartementSummary(appartementId);
    }

    // 🧾 Reçu PDF d'un paiement - Returns actual PDF bytes
    // GET /api/quittances/paiement/{paiementId}
    @GetMapping("/paiement/{paiementId}")
    public ResponseEntity<byte[]> generateRecuPaiementPDF(
            @PathVariable Long paiementId
    ) {
        try {
            QuittancePDF quittance = quittancePDFService.generateReçuPaiementPDF(paiementId);
            
            if (quittance == null || quittance.getCheminFichier() == null) {
                return ResponseEntity.notFound().build();
            }

            // Read the PDF file from disk
            File pdfFile = new File(quittance.getCheminFichier());
            if (!pdfFile.exists()) {
                return ResponseEntity.notFound().build();
            }

            byte[] pdfBytes = Files.readAllBytes(pdfFile.toPath());

            // Set headers for PDF download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Recu_Paiement_" + paiementId + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
            
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
