package com.example.backend_syndic.Dao;

import com.example.backend_syndic.entity.AppelCharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppelChargeRepository extends JpaRepository<AppelCharge, Long> {
    java.util.List<AppelCharge> findByCharge(com.example.backend_syndic.entity.Charge charge);

    boolean existsByAppartementProprietaireIdAndStatusLabelNot(Long userId, String statusLabel);

    long countByChargeId(Long chargeId);

    long countByChargeIdAndStatusLabel(Long chargeId, String label);

    java.util.List<AppelCharge> findByAppartementImmeubleId(Long immeubleId);
}