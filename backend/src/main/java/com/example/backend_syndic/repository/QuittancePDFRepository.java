package com.example.backend_syndic.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuittancePDFRepository extends JpaRepository<QuittancePDFRepository,Long> {
}
