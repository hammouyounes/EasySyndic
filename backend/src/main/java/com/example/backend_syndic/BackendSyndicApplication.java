package com.example.backend_syndic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendSyndicApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendSyndicApplication.class, args);
	}

}
