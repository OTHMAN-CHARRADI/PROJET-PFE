package com.pfe.learningplatform;

import org.springframework.boot.SpringApplication;

import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.autoconfigure.domain.EntityScan;


@SpringBootApplication

@EntityScan(
        basePackages =
                "com.pfe.learningplatform.model"
)

public class SpringBackendApplication {

    public static void main(String[] args) {

        SpringApplication.run(
                SpringBackendApplication.class,
                args
        );
    }
}