package com.example.backend_syndic.service;

import com.example.backend_syndic.repository.ImmeubleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ImmeubleService {

    @Autowired
    private ImmeubleRepository repo;
}
