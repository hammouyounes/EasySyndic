package com.example.backend_syndic.service.Impl;

import com.example.backend_syndic.Dao.AppelChargeRepository;
import com.example.backend_syndic.service.facade.AppelChargeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AppelChargeServiceImpl implements AppelChargeService {

    @Autowired
    private AppelChargeRepository repo;
}
