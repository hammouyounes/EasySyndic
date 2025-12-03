package com.example.backend_syndic.service;

import com.example.backend_syndic.repository.ChargeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChargeService {

    @Autowired
    private ChargeRepository repo;
}
