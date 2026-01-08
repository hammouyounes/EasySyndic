package com.example.backend_syndic.Dao;

import com.example.backend_syndic.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend_syndic.entity.AppelCharge;

@Repository
public interface PaiementRepository extends JpaRepository <Paiement,Long> {
    boolean existsByAppelCharge(AppelCharge appelCharge);
    boolean existsByAppelCharge_Charge_Id(Long chargeId);
    boolean existsByUserId(Long userId);
}
