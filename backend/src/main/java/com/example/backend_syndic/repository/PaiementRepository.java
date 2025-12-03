package com.example.backend_syndic.repository;

import com.example.backend_syndic.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaiementRepository extends JpaRepository <Paiement,Long> {
}
