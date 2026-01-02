package com.example.backend_syndic.service.facade;

import com.example.backend_syndic.entity.AppelCharge;
import java.util.List;

public interface AppelChargeService {
    void distributeCharge(Long chargeId);
    List<AppelCharge> getAllAppelCharges();
}
