package com.example.backend_syndic.ws;

import com.example.backend_syndic.entity.Charge;
import com.example.backend_syndic.service.facade.ChargeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/charges")
public class ChargeController {

    @Autowired
    private ChargeService chargeService;

    @Autowired
    private com.example.backend_syndic.service.facade.AppelChargeService appelChargeService;

    // ➕ POST /api/charges
    @PostMapping("/immeuble/{immeubleId}")
    public Charge createCharge(
            @PathVariable Long immeubleId,
            @RequestBody Charge charge
    ) {
        return chargeService.createCharge(immeubleId, charge);
    }


    // ✏️ PUT /api/charges/{id}
    @PutMapping("/{id}")
    public Charge updateCharge(
            @PathVariable Long id,
            @RequestBody Charge charge
    ) {
        return chargeService.updateCharge(id, charge);
    }

    @DeleteMapping("/{id}")
    public void deleteCharge(@PathVariable Long id) {
        chargeService.deleteCharge(id);
    }

    // 🚀 Distribute Charge
    @PostMapping("/{id}/distribute")
    public void distributeCharge(@PathVariable Long id) {
        appelChargeService.distributeCharge(id);
    }

    // ↩️ Undo Distribute Charge
    @PostMapping("/{id}/undo-distribute")
    public void undoDistributeCharge(@PathVariable Long id) {
        appelChargeService.undoDistributeCharge(id);
    }

    // 🔍 GET /api/charges/{id}
    @GetMapping("/{id}")
    public Charge getChargeById(@PathVariable Long id) {
        return chargeService.getChargeById(id);
    }

    // 📋 GET /api/charges
    @GetMapping
    public List<Charge> getAllCharges() {
        return chargeService.getAllCharges();
    }

    // 🏢 GET /api/charges/immeuble/{immeubleId}
    @GetMapping("/immeuble/{immeubleId}")
    public List<Charge> getChargesByImmeuble(
            @PathVariable Long immeubleId
    ) {
        return chargeService.getChargesByImmeuble(immeubleId);
    }

    @GetMapping("/periode")
    public List<Charge> getChargesByPeriode(
            @RequestParam int year,
            @RequestParam(required = false) Integer month // optional
    ) {
        if (year < 1900 || year > 2100) {
            throw new IllegalArgumentException("Invalid year");
        }

        return chargeService.getChargesByPeriode(year, month);
    }




    // 💰 GET /api/charges/immeuble/{immeubleId}/total
    @GetMapping("/immeuble/{immeubleId}/total")
    public double calculateTotalChargesForImmeuble(
            @PathVariable Long immeubleId
    ) {
        return chargeService.calculateTotalChargesForImmeuble(immeubleId);
    }

    // 🧮 GET /api/charges/appartement/{appartementId}/montant
    @GetMapping("/immeuble/{immeubleId}/montant")
    public double calculateChargePerAppartement(
            @PathVariable Long immeubleId
    ) {
        return chargeService.calculateChargePerAppartement(immeubleId);
    }


}
