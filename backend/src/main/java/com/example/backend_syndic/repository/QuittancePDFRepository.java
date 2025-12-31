package com.example.backend_syndic.repository;

import com.example.backend_syndic.entity.QuittancePDF;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuittancePDFRepository extends JpaRepository<QuittancePDF,Long> {
}
