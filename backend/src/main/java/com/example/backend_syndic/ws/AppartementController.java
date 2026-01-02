    package com.example.backend_syndic.ws;

    import com.example.backend_syndic.entity.Appartement;
    import com.example.backend_syndic.entity.User;
    import com.example.backend_syndic.service.facade.AppartementService;
    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;

    @RestController
    @RequestMapping("/api/appartements")
    public class AppartementController {

        @Autowired
        private AppartementService appartementService;

        // 🔹 GET /api/appartements
        @GetMapping
        public List<Appartement> getAllAppartements() {
            return appartementService.getAllAppartements();
        }

        // 🔹 GET /api/appartements/{id}
        @GetMapping("/{id}")
        public Appartement getAppartementById(@PathVariable Long id) {
            return appartementService.getAppartementById(id);
        }

        // 🔹 POST /api/appartements/immeuble/{immeubleId}
        @PostMapping("/immeuble/{immeubleId}")
        public Appartement createAppartement(
                @PathVariable Long immeubleId,
                @RequestBody Appartement appartement
        ) {
            return appartementService.createAppartement(immeubleId, appartement);
        }

        // 🔹 PUT /api/appartements/{id}
        @PutMapping("/{id}")
        public Appartement updateAppartement(
                @PathVariable Long id,
                @RequestBody Appartement appartement
        ) {
            return appartementService.updateAppartement(id, appartement);
        }

        // 🔹 DELETE /api/appartements/{id}
        @DeleteMapping("/{id}")
        public void deleteAppartement(@PathVariable Long id) {
            appartementService.deleteAppartement(id);
        }

        // 🔹 GET /api/appartements/immeuble/{immeubleId}
        @GetMapping("/immeuble/{immeubleId}")
        public List<Appartement> getAppartementsByImmeuble(
                @PathVariable Long immeubleId
        ) {
            return appartementService.getAppartementsByImmeubleId(immeubleId);
        }

        @PutMapping("/{id}/proprietaire/{proprietaireId}")
        public Appartement assignProprietaire(
                @PathVariable Long id,
                @PathVariable Long proprietaireId
        ) {
            return appartementService.assignProprietaire(id, proprietaireId);
        }

        @PutMapping("/{id}/locataire/{locataireId}")
        public Appartement assignLocataire(
                @PathVariable Long id,
                @PathVariable Long locataireId
        ) {
            return appartementService.assignLocataire(id, locataireId);
        }


        // 🔹 PUT /api/appartements/{id}/remove-locataire
        @PutMapping("/{id}/remove-locataire")
        public Appartement removeLocataire(@PathVariable Long id) {
            return appartementService.removeLocataire(id);
        }
        @PutMapping("/{id}/remove-proprietaire")
        public Appartement removeProprietaire(@PathVariable Long id) {
            return appartementService.removeProprietaire(id);
        }

        // 🔹 GET /api/appartements/immeuble/{immeubleId}/surface-totale
        @GetMapping("/immeuble/{immeubleId}/surface-totale")
        public double calculateSurfaceTotale(
                @PathVariable Long immeubleId
        ) {
            return appartementService.calculateSurfaceTotaleByImmeuble(immeubleId);
        }
    }
