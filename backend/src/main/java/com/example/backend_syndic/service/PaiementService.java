package com.example.backend_syndic.service;

import com.example.backend_syndic.repository.PaiementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PaiementService {

    @Autowired
    private PaiementRepository repo;
}
