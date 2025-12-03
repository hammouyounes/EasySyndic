package com.example.backend_syndic.service;

import com.example.backend_syndic.repository.AppartementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AppartementService {

    @Autowired
    private AppartementRepository repo;
}
