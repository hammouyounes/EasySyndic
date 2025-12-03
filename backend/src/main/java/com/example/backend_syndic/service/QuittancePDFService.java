package com.example.backend_syndic.service;

import com.example.backend_syndic.repository.QuittancePDFRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QuittancePDFService {

    @Autowired
    private QuittancePDFRepository repo;
}
