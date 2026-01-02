package com.example.backend_syndic.Dao;

import com.example.backend_syndic.entity.Immeuble;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImmeubleRepository extends JpaRepository<Immeuble, Long> {

}
