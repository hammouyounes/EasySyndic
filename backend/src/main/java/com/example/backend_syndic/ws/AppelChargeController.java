package com.example.backend_syndic.ws;

import com.example.backend_syndic.entity.AppelCharge;
import com.example.backend_syndic.service.facade.AppelChargeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/appel-charges")
public class AppelChargeController {

    @Autowired
    private AppelChargeService service;

    @GetMapping
    public List<AppelCharge> getAllAppelCharges() {
        return service.getAllAppelCharges();
    }
}
