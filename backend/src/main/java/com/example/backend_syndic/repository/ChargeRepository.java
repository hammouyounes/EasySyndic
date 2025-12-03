package com.example.backend_syndic.repository;

import com.example.backend_syndic.entity.Charge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChargeRepository extends JpaRepository<Charge,Long> {
}
