package com.pfe.learningplatform.exception;

public class QuizNotFoundException
        extends RuntimeException {

    public QuizNotFoundException(
            String message
    ) {

        super(message);
    }
}