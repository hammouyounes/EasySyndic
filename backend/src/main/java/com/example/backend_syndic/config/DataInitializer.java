package com.example.backend_syndic.config;

import com.example.backend_syndic.Dao.StatusRepository;
import com.example.backend_syndic.entity.Status;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initData(StatusRepository statusRepository) {
        return args -> {
            List<String> statuses = Arrays.asList("PAYÉ", "IMPAYÉ", "EN_ATTENTE", "EN_RETARD");

            for (String label : statuses) {
                if (statusRepository.findByLabel(label).isEmpty()) {
                    Status status = new Status();
                    status.setLabel(label);
                    statusRepository.save(status);
                    System.out.println("Status created: " + label);
                }
            }
        };
    }
}
