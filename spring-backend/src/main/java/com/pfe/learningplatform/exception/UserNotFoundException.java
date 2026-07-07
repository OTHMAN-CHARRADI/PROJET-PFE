package com.pfe.learningplatform.exception;

public class UserNotFoundException
        extends RuntimeException {

    public UserNotFoundException(
            String message
    ) {

        super(message);
    }
}