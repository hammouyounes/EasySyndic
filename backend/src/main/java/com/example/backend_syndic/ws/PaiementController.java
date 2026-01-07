package com.example.backend_syndic.ws;

import com.example.backend_syndic.entity.Paiement;
import com.example.backend_syndic.service.facade.PaiementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paiements")
@CrossOrigin(origins = "*") // Adjust for production
public class PaiementController {

    @Autowired
    private PaiementService paiementService;

    @PostMapping("/appartement/{appartementId}")
    public ResponseEntity<Paiement> createPaiement(@RequestBody Paiement paiement, @PathVariable Long appartementId) {
        if (paiement.getMontant() <= 0) {
            return ResponseEntity.badRequest().build();
        }
        Paiement newPaiement = paiementService.addPaiement(paiement, appartementId);
        return new ResponseEntity<>(newPaiement, HttpStatus.CREATED);
    }

    @PostMapping("/user/{userId}/appartement/{appartementId}/appel-charge/{appelChargeId}")
    public ResponseEntity<Paiement> createPaiementFull(
            @RequestBody Paiement paiement, 
            @PathVariable Long userId,
            @PathVariable Long appartementId,
            @PathVariable Long appelChargeId) {
        
        // Construct partial objects for service processing
        com.example.backend_syndic.entity.User user = new com.example.backend_syndic.entity.User();
        user.setId(userId);
        paiement.setUser(user);
        
        com.example.backend_syndic.entity.AppelCharge appelCharge = new com.example.backend_syndic.entity.AppelCharge();
        appelCharge.setId(appelChargeId);
        paiement.setAppelCharge(appelCharge);

        Paiement newPaiement = paiementService.addPaiement(paiement, appartementId);
        return new ResponseEntity<>(newPaiement, HttpStatus.CREATED);
    }

    @GetMapping
    public List<Paiement> getAllPaiements() {
        return paiementService.getAllPaiements();
    }
    
    @GetMapping("/appartement/{appartementId}")
    public List<Paiement> getPaiementsByAppartement(@PathVariable Long appartementId) {
        return paiementService.getPaiementsByAppartement(appartementId);
    }

    @GetMapping("/immeuble/{immeubleId}")
    public List<Paiement> getPaiementsByImmeuble(@PathVariable Long immeubleId) {
        return paiementService.getPaiementsByImmeuble(immeubleId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paiement> getPaiementById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(paiementService.getPaiementById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Paiement> updatePaiement(@PathVariable Long id, @RequestBody Paiement paiement) {
        try {
            return ResponseEntity.ok(paiementService.updatePaiement(id, paiement));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaiement(@PathVariable Long id) {
        try {
            paiementService.deletePaiement(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
