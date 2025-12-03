package com.example.backend_syndic.repository;

import com.example.backend_syndic.entity.AppelCharge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppelChargeRepository extends JpaRepository<AppelCharge,Long> {
}