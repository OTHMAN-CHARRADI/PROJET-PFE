package com.pfe.learningplatform.exception;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.ExceptionHandler;

import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {



    @ExceptionHandler(
            UserNotFoundException.class
    )

    public ResponseEntity<Map<String, Object>>
    handleUserNotFound(

            UserNotFoundException ex
    ) {

        Map<String, Object> error =
                new HashMap<>();

        error.put(
                "timestamp",
                LocalDateTime.now()
        );

        error.put(
                "status",
                HttpStatus.NOT_FOUND.value()
        );

        error.put(
                "message",
                ex.getMessage()
        );

        return new ResponseEntity<>(

                error,

                HttpStatus.NOT_FOUND
        );
    }



    @ExceptionHandler(
            CourseNotFoundException.class
    )

    public ResponseEntity<Map<String, Object>>
    handleCourseNotFound(

            CourseNotFoundException ex
    ) {

        Map<String, Object> error =
                new HashMap<>();

        error.put(
                "timestamp",
                LocalDateTime.now()
        );

        error.put(
                "status",
                HttpStatus.NOT_FOUND.value()
        );

        error.put(
                "message",
                ex.getMessage()
        );

        return new ResponseEntity<>(

                error,

                HttpStatus.NOT_FOUND
        );
    }



    @ExceptionHandler(
            QuizNotFoundException.class
    )

    public ResponseEntity<Map<String, Object>>
    handleQuizNotFound(

            QuizNotFoundException ex
    ) {

        Map<String, Object> error =
                new HashMap<>();

        error.put(
                "timestamp",
                LocalDateTime.now()
        );

        error.put(
                "status",
                HttpStatus.NOT_FOUND.value()
        );

        error.put(
                "message",
                ex.getMessage()
        );

        return new ResponseEntity<>(

                error,

                HttpStatus.NOT_FOUND
        );
    }



    @ExceptionHandler(
            InvalidAdminCodeException.class
    )

    public ResponseEntity<Map<String, Object>>
    handleInvalidAdminCode(

            InvalidAdminCodeException ex
    ) {

        Map<String, Object> error =
                new HashMap<>();

        error.put(
                "timestamp",
                LocalDateTime.now()
        );

        error.put(
                "status",
                HttpStatus.BAD_REQUEST.value()
        );

        error.put(
                "message",
                ex.getMessage()
        );

        return new ResponseEntity<>(

                error,

                HttpStatus.BAD_REQUEST
        );
    }



    @ExceptionHandler(
            UnauthorizedException.class
    )

    public ResponseEntity<Map<String, Object>>
    handleUnauthorized(

            UnauthorizedException ex
    ) {

        Map<String, Object> error =
                new HashMap<>();

        error.put(
                "timestamp",
                LocalDateTime.now()
        );

        error.put(
                "status",
                HttpStatus.UNAUTHORIZED.value()
        );

        error.put(
                "message",
                ex.getMessage()
        );

        return new ResponseEntity<>(

                error,

                HttpStatus.UNAUTHORIZED
        );
    }



    @ExceptionHandler(
            Exception.class
    )

    public ResponseEntity<Map<String, Object>>
    handleGlobalException(

            Exception ex
    ) {

        Map<String, Object> error =
                new HashMap<>();

        error.put(
                "timestamp",
                LocalDateTime.now()
        );

        error.put(
                "status",
                HttpStatus.INTERNAL_SERVER_ERROR.value()
        );

        error.put(
                "message",
                ex.getMessage()
        );

        return new ResponseEntity<>(

                error,

                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}