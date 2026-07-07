package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.ChatMessage;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageRepository
        extends JpaRepository<ChatMessage, Long> {

}