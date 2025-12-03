package com.example.backend_syndic.repository;

import com.example.backend_syndic.entity.Appartement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AppartementRepository extends JpaRepository<Appartement,Long> {
}
