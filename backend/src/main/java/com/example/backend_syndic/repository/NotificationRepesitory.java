package com.example.backend_syndic.repository;

import com.sun.nio.sctp.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepesitory extends JpaRepository <Notification,Long>{
}