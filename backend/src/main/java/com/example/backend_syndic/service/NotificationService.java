package com.example.backend_syndic.service;

import com.example.backend_syndic.repository.NotificationRepesitory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepesitory repo;
}
