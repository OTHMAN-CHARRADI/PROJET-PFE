package com.pfe.learningplatform.repository;

import com.pfe.learningplatform.model.MessageReply;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageReplyRepository extends JpaRepository<MessageReply, Long> {

    
    List<MessageReply> findByContactMessageIdOrderBySentAtAsc(Long contactMessageId);
}