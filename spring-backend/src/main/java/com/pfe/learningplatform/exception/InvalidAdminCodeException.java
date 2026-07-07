package com.pfe.learningplatform.exception;

public class InvalidAdminCodeException
        extends RuntimeException {

    public InvalidAdminCodeException(
            String message
    ) {

        super(message);
    }
}