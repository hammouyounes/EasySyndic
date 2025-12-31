package com.example.backend_syndic.repository;


import com.example.backend_syndic.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepesitory extends JpaRepository <Notification,Long>{
}