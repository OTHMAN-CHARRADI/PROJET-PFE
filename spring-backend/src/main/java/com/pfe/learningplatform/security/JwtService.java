package com.pfe.learningplatform.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import java.security.Key;

import java.util.Date;

@Service
public class JwtService {

        private static final String SECRET =

                        "mysecretkeymysecretkeymysecretkey123456";



        private Key getSignKey() {

                return Keys.hmacShaKeyFor(
                                SECRET.getBytes());
        }



        public String generateToken(
                        String email) {

                return Jwts.builder()

                                .setSubject(email)

                                .setIssuedAt(
                                                new Date())

                                .setExpiration(

                                                new Date(

                                                                System.currentTimeMillis()

                                                                                + 1000L * 60 * 60 * 24 * 7
                                                ))

                                .signWith(

                                                getSignKey(),

                                                SignatureAlgorithm.HS256)

                                .compact();
        }



        public String extractEmail(
                        String token) {

                return extractAllClaims(token)
                                .getSubject();
        }



        private Claims extractAllClaims(
                        String token) {

                return Jwts.parserBuilder()

                                .setSigningKey(
                                                getSignKey())

                                .build()

                                .parseClaimsJws(token)

                                .getBody();
        }



        public boolean isTokenValid(

                        String token,

                        String email) {

                return extractEmail(token)
                                .equals(email);
        }
}