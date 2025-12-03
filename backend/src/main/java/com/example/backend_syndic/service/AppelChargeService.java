package com.example.backend_syndic.service;

import com.example.backend_syndic.repository.AppelChargeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AppelChargeService {

    @Autowired
    private AppelChargeRepository repo;
}
