package com.pfe.learningplatform.service;

import com.pfe.learningplatform.dto.*;
import com.pfe.learningplatform.model.Role;
import com.pfe.learningplatform.model.User;
import com.pfe.learningplatform.repository.UserRepository;
import com.pfe.learningplatform.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class AuthService {

        private final UserRepository userRepository;
        private final JwtService jwtService;
        private final PasswordEncoder passwordEncoder;

        @Value("${admin.secret-code}")
        private String adminSecretCode;


        private static final String UPLOAD_DIR = "uploads/avatars/";

        public AuthService(UserRepository userRepository, JwtService jwtService,
                        PasswordEncoder passwordEncoder) {
                this.userRepository = userRepository;
                this.jwtService = jwtService;
                this.passwordEncoder = passwordEncoder;

                try {
                        Files.createDirectories(Paths.get(UPLOAD_DIR));
                } catch (IOException ignored) {
                }
        }



        public UserResponse register(RegisterRequest request) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                        throw new RuntimeException("Email déjà utilisé");
                }
                if (request.getUsername() != null &&
                                userRepository.findByUsername(request.getUsername()).isPresent()) {
                        throw new RuntimeException("Nom d'utilisateur déjà pris");
                }

                Role role = Role.USER;
                if (request.getRole() == Role.ADMIN) {
                        if (request.getAdminCode() == null || !request.getAdminCode().equals(adminSecretCode)) {
                                throw new RuntimeException("Code admin invalide");
                        }
                        role = Role.ADMIN;
                }

                String username = request.getUsername() != null ? request.getUsername()
                                : (request.getNom() != null ? request.getNom() : request.getEmail().split("@")[0]);

                User user = User.builder()
                                .username(username)
                                .nom(request.getNom())
                                .prenom(request.getPrenom())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .level("débutant")
                                .role(role)
                                .build();

                userRepository.save(user);
                return toUserResponse(user);
        }



        public AuthResponse login(LoginRequest request) {
                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

                if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        throw new RuntimeException("Email ou mot de passe incorrect");
                }

                String token = jwtService.generateToken(user.getEmail());
                return new AuthResponse(token);
        }



        public UserResponse getMe(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
                return toUserResponse(user);
        }



        public UserResponse updateProfile(String email, UpdateProfileRequest request) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
                        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
                                throw new RuntimeException("Nom d'utilisateur déjà pris");
                        }
                        user.setUsername(request.getUsername());
                }

                if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
                        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                                throw new RuntimeException("Email déjà utilisé");
                        }
                        user.setEmail(request.getEmail());
                }

                if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
                        if (request.getCurrentPassword() == null ||
                                        !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                                throw new RuntimeException("Mot de passe actuel incorrect");
                        }
                        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                }

                userRepository.save(user);
                return toUserResponse(user);
        }



        public UserResponse uploadAvatar(String email, MultipartFile file) throws IOException {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "avatar";
                String ext = originalFilename.contains(".")
                                ? originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase()
                                : ".jpg";

                String filename = user.getId() + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;


                if (user.getProfilePicture() != null) {
                        try {
                                Files.deleteIfExists(Paths.get(UPLOAD_DIR + user.getProfilePicture()));
                        } catch (IOException ignored) {
                        }
                }

                Files.write(Paths.get(UPLOAD_DIR + filename), file.getBytes());
                user.setProfilePicture(filename);
                userRepository.save(user);
                return toUserResponse(user);
        }



        public UserResponse deleteAvatar(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                if (user.getProfilePicture() != null) {
                        try {
                                Files.deleteIfExists(Paths.get(UPLOAD_DIR + user.getProfilePicture()));
                        } catch (IOException ignored) {
                        }
                        user.setProfilePicture(null);
                        userRepository.save(user);
                }
                return toUserResponse(user);
        }



        public void deleteAccount(String email, String password) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                if (!passwordEncoder.matches(password, user.getPassword())) {
                        throw new RuntimeException("Mot de passe incorrect");
                }

                if (user.getProfilePicture() != null) {
                        try {
                                Files.deleteIfExists(Paths.get(UPLOAD_DIR + user.getProfilePicture()));
                        } catch (IOException ignored) {
                        }
                }

                userRepository.delete(user);
        }



        public UserResponse toUserResponse(User user) {
                return UserResponse.builder()
                                .id(user.getId())
                                .username(user.getUsername())
                                .email(user.getEmail())
                                .level(user.getLevel() != null ? user.getLevel() : "débutant")
                                .profilePicture(user.getProfilePicture())
                                .createdAt(user.getCreatedAt())
                                .role(user.getRole() != null ? user.getRole().name() : "USER")
                                .build();
        }
}