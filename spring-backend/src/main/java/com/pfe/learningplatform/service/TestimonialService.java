package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.TestimonialRequest;
import com.pfe.learningplatform.dto.TestimonialResponse;
import com.pfe.learningplatform.model.Testimonial;
import com.pfe.learningplatform.model.User;
import com.pfe.learningplatform.repository.TestimonialRepository;
import com.pfe.learningplatform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestimonialService {

    private final TestimonialRepository testimonialRepository;
    private final UserRepository userRepository;


    private static final String[] COLORS = {
            "from-blue-500 to-cyan-500",
            "from-purple-500 to-pink-500",
            "from-emerald-500 to-teal-500",
            "from-orange-500 to-amber-500",
            "from-indigo-500 to-blue-500",
            "from-rose-500 to-pink-500"
    };

    public TestimonialService(TestimonialRepository testimonialRepository,
            UserRepository userRepository) {
        this.testimonialRepository = testimonialRepository;
        this.userRepository = userRepository;
    }



    public List<TestimonialResponse> getApprovedTestimonials() {
        return testimonialRepository.findByApprovedTrueOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }



    public TestimonialResponse submitTestimonial(String username, TestimonialRequest request) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));


        String displayName = (request.getName() != null && !request.getName().isBlank())
                ? request.getName()
                : user.getUsername();
        String avatar = buildAvatar(displayName);


        String color = COLORS[(int) (user.getId() % COLORS.length)];

        Testimonial t = Testimonial.builder()
                .name(displayName)
                .role(request.getRole() != null ? request.getRole() : "")
                .text(request.getText())
                .rating(request.getRating())
                .avatar(avatar)
                .color(color)
                .approved(false)
                .user(user)
                .build();

        return toResponse(testimonialRepository.save(t));
    }



    public List<TestimonialResponse> getAllTestimonials() {
        return testimonialRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }



    public List<TestimonialResponse> getPendingTestimonials() {
        return testimonialRepository.findByApprovedFalseAndRejectedFalseOrderByCreatedAtDesc()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }



    public TestimonialResponse approveTestimonial(Long id) {
        Testimonial t = testimonialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Témoignage introuvable"));
        t.setApproved(true);
        t.setRejected(false);
        return toResponse(testimonialRepository.save(t));
    }



    public TestimonialResponse rejectTestimonial(Long id) {
        Testimonial t = testimonialRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Témoignage introuvable"));
        t.setApproved(false);
        t.setRejected(true);
        return toResponse(testimonialRepository.save(t));
    }



    public void deleteTestimonial(Long id) {
        if (!testimonialRepository.existsById(id))
            throw new RuntimeException("Témoignage introuvable");
        testimonialRepository.deleteById(id);
    }



    private String buildAvatar(String name) {
        if (name == null || name.isBlank())
            return "?";
        String[] parts = name.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
        return (parts[0].charAt(0) + "" + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    private TestimonialResponse toResponse(Testimonial t) {
        return TestimonialResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .role(t.getRole())
                .text(t.getText())
                .rating(t.getRating())
                .avatar(t.getAvatar())
                .color(t.getColor())
                .approved(t.isApproved())
                .rejected(t.isRejected())
                .createdAt(t.getCreatedAt())
                .userId(t.getUser() != null ? t.getUser().getId() : null)
                .build();
    }
}