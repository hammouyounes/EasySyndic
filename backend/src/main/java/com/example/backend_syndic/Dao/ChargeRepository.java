package com.example.backend_syndic.Dao;

import com.example.backend_syndic.entity.Charge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChargeRepository extends JpaRepository<Charge,Long> {

    // find by year only
    @Query("SELECT c FROM Charge c WHERE c.periode LIKE :yearStr%")
    List<Charge> findByYear(@Param("yearStr") String yearStr);

    // find by month and year
    @Query("SELECT c FROM Charge c WHERE c.periode = CONCAT(:yearStr, '-', :monthStr)")
    List<Charge> findByMonthAndYear(@Param("monthStr") String monthStr, @Param("yearStr") String yearStr);

}

