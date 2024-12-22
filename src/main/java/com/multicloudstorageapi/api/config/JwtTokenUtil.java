package com.multicloudstorageapi.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.*;

import javax.crypto.spec.SecretKeySpec;
import java.io.Serializable;
import java.security.Key;
import java.util.*;
import java.util.function.Function;

@Component
public class JwtTokenUtil implements Serializable {

    private static final long serialVersionUID = -2550185165626007488L;

    // Token validity in seconds (5 hours)
    public static final long JWT_TOKEN_VALIDITY = 5 * 60 * 60;

    @Value("${jwt.secret}")
    private String secret;

    /**
     * Retrieve a specific claim from a JWT token.
     */
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) throws JwtException {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Retrieve the username (subject) from a JWT token.
     */
    public String getUsernameFromToken(String token) throws JwtException {
        return getClaimFromToken(token, Claims::getSubject);
    }

    /**
     * Retrieve the expiration date from a JWT token.
     */
    public Date getExpirationDateFromToken(String token) throws JwtException {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    /**
     * Parse the token to retrieve all claims.
     */
    private Claims getAllClaimsFromToken(String token) throws JwtException {
        try {
            Key signingKey = getSigningKey(secret);
            return  Jwts.parser()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            throw new JwtException("Failed to parse JWT token", e);
        }
    }

    /**
     * Generate the signing key from the secret.
     */
    private Key getSigningKey(String secret) {
        byte[] secretBytes = Base64.getDecoder().decode(secret);
        return new SecretKeySpec(secretBytes, SignatureAlgorithm.HS512.getJcaName());
    }

    /**
     * Check if the token has expired.
     */
    public Boolean isTokenExpired(String token) throws JwtException {
        try {
            Claims claims = getAllClaimsFromToken(token);

            if (isExternalOAuthToken(claims)) {
                return isExternalTokenExpired(claims);
            } else {
                final Date expiration = claims.getExpiration();
                return expiration.before(new Date());
            }
        } catch (JwtException e) {
            throw new JwtException("Error checking token expiration: " + e.getMessage(), e);
        }
    }

    /**
     * Check if the token is an external OAuth token.
     */
    private boolean isExternalOAuthToken(Claims claims) {
        return claims.containsKey("expires_in");
    }

    /**
     * Check if an external OAuth token has expired based on the 'expires_in' field.
     */
    private Boolean isExternalTokenExpired(Claims claims) {
        Long expiresIn = claims.get("expires_in", Long.class);
        Long issuedAt = claims.getIssuedAt() != null ? claims.getIssuedAt().getTime() : System.currentTimeMillis();

        if (expiresIn == null) {
            throw new JwtException("'expires_in' claim is missing in the token.");
        }

        return new Date().after(new Date(issuedAt + (expiresIn * 1000)));
    }

    /**
     * Generate a new JWT token for the given user details.
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return doGenerateToken(claims, userDetails.getUsername());
    }

    /**
     * Helper method to generate a token.
     */
    private String doGenerateToken(Map<String, Object> claims, String subject) {
        Key signingKey = getSigningKey(secret);
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY * 1000))
                .signWith(signingKey, SignatureAlgorithm.HS512)
                .compact();
    }

    /**
     * Validate a token against the provided user details.
     */
    public Boolean validateToken(String token, UserDetails userDetails) throws JwtException {
        final String username = getUsernameFromToken(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
