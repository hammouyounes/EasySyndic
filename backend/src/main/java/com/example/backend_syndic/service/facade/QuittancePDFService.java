package com.example.backend_syndic.service.facade;

import com.example.backend_syndic.entity.QuittancePDF;

public interface QuittancePDFService {

    // Générer un rapport de paiements pour un immeuble
    QuittancePDF generatePaiementsReportForImmeuble(Long immeubleId);

    // Générer un rapport de charges pour un mois spécifique
    QuittancePDF generateChargesReportForMonth(int month, int year);

    // Générer un résumé pour un appartement
    QuittancePDF generateAppartementSummary(Long appartementId);

    // Générer le PDF d’une quittance de paiement
    QuittancePDF generateReçuPaiementPDF(Long paiementId);
}
