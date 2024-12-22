package com.multicloudstorageapi.api.services;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.multicloudstorageapi.api.entities.OAuthCredential;
import com.multicloudstorageapi.api.entities.StorageDrive;
import com.multicloudstorageapi.api.repositories.OAuthCredentialRepository;
import com.multicloudstorageapi.api.repositories.StorageDriveRepository;
import io.jsonwebtoken.JwtException;
import utils.SecurityContextUtil;

import com.multicloudstorageapi.api.config.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Optional;

@Service
public class TokenManagementService {

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private OAuthCredentialRepository oAuthCredentialRepository;

    @Autowired
    private StorageDriveRepository storageDriveRepository;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.redirect-uri}")
    private String googleRedirectUri;
    
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;
    
    @Value("${spring.security.oauth2.client.provider.google.authorization-uri}")
    private String googleAuthUri;
    
    @Value("${spring.security.oauth2.client.provider.google.user-info-uri}")
    private String googleUserInfoUri;
    
    @Value("${spring.security.oauth2.client.provider.google.token-uri}")
    private String googleTokenUri;

    

    @Value("${spring.security.oauth2.client.registration.microsoft.client-id}")
    private String microsoftClientId;
	
    @Value("${spring.security.oauth2.client.registration.microsoft.redirect-uri}")
    private String microsoftRedirectUri;

    @Value("${spring.security.oauth2.client.registration.microsoft.client-secret}")
    private String microsoftClientSecret;

    @Value("${spring.security.oauth2.client.provider.microsoft.authorization-uri}")
    private String microsoftAuthUri;

    @Value("${spring.security.oauth2.client.provider.microsoft.token-uri}")
    private String microsoftTokenUri;

    @Value("${spring.security.oauth2.client.provider.microsoft.user-info-uri}")
    private String microsoftUserInfoUri;

    public static final String GOOGLE = "Google Drive";
    public static final String ONEDRIVE = "OneDrive";

    public Integer extractUserId() {
    	Integer userId = SecurityContextUtil.extractUserIdFromSecurityContext();
    	return userId;
    }
    /**
     * Check and refresh the token if expired, update the database.
     */
    public String checkAndRefreshToken(Integer userId, Integer driveId) {
        Optional<OAuthCredential> optionalOAuthCredential = oAuthCredentialRepository.findByDriveId(driveId);

        if (optionalOAuthCredential.isPresent()) {
            OAuthCredential oauthCredential = optionalOAuthCredential.get();
            String currentAccessToken = oauthCredential.getAccessToken();
            String currentRefreshToken = oauthCredential.getRefreshToken();

            // Check if the token has expired
            if (isTokenExpired(currentAccessToken)) {
                String newAccessToken = refreshAccessToken(currentRefreshToken, driveId);
                oauthCredential.setAccessToken(newAccessToken);
                oAuthCredentialRepository.save(oauthCredential); // Save updated access token

                return newAccessToken;
            }

            return currentAccessToken; // If token is valid, return current token
        }

        throw new RuntimeException("OAuthCredential not found for driveId: " + driveId);
    }

    // Check if the access token is expired using JwtTokenUtil
    public boolean isTokenExpired(String accessToken) {
        try {
            return jwtTokenUtil.isTokenExpired(accessToken); // Use JwtTokenUtil to check expiration
        } catch (JwtException e) {
            return true; // Treat invalid token as expired
        }
    }

    /**
     * Refresh the access token using the refresh token.
     */
    private String refreshAccessToken(String refreshToken, Integer driveId) {
        StorageDrive drive = getStorageDrive(driveId);

        if (GOOGLE.equalsIgnoreCase(drive.getDriveName())) {
            return refreshGoogleAccessToken(refreshToken);
        } else if (ONEDRIVE.equalsIgnoreCase(drive.getDriveName())) {
            return refreshOneDriveAccessToken(refreshToken);
        } else {
            throw new IllegalArgumentException("Unsupported drive type: " + drive.getDriveName());
        }
    }

    /**
     * Refresh Google access token.
     */
    private String refreshGoogleAccessToken(String refreshToken) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientSecret);
        body.add("refresh_token", refreshToken);
        body.add("grant_type", "refresh_token");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(googleTokenUri, HttpMethod.POST, request, String.class);
        return extractAccessTokenFromResponse(response.getBody());
    }

    /**
     * Refresh OneDrive access token.
     */
    private String refreshOneDriveAccessToken(String refreshToken) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", microsoftClientId);
        body.add("client_secret", microsoftClientSecret);
        body.add("refresh_token", refreshToken);
        body.add("grant_type", "refresh_token");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.exchange(microsoftTokenUri, HttpMethod.POST, request, String.class);
        return extractAccessTokenFromResponse(response.getBody());
    }

    /**
     * Exchange authorization code for access token, fetch user info, and save to database.
     */
    public void handleAuthorization(String code, Integer userId, String provider) {
        String tokenUrl;
        String userInfoUrl;
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();

        if (GOOGLE.equalsIgnoreCase(provider)) {
            tokenUrl = googleTokenUri;
            userInfoUrl = googleUserInfoUri;
            body.add("client_id", googleClientId);
            body.add("client_secret", googleClientSecret);
            body.add("redirect_uri", googleRedirectUri);
            body.add("grant_type", "authorization_code");
        } else if (ONEDRIVE.equalsIgnoreCase(provider)) {
            tokenUrl = microsoftTokenUri;
            userInfoUrl = microsoftUserInfoUri;
            body.add("client_id", microsoftClientId);
            body.add("client_secret", microsoftClientSecret);
            body.add("redirect_uri", microsoftRedirectUri);
            body.add("grant_type", "authorization_code");
        } else {
            throw new IllegalArgumentException("Unsupported provider: " + provider);
        }

        body.add("code", code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        ResponseEntity<String> tokenResponse = restTemplate.exchange(tokenUrl, HttpMethod.POST, request, String.class);
        String accessToken = extractAccessTokenFromResponse(tokenResponse.getBody());
        String refreshToken = getRefreshTokenFromResponse(tokenResponse.getBody());
        String userEmail = fetchDriveUserEmail(accessToken, provider, userInfoUrl);

        // Save credentials to database
        StorageDrive drive = storageDriveRepository.findByDriveName(provider)
                .orElseThrow(() -> new RuntimeException("StorageDrive not found for provider: " + provider));
        Integer driveId = drive.getDriveId();
        OAuthCredential credential = new OAuthCredential();

        credential.setUserId(userId);  // Link OAuthCredential to the User
        credential.setDriveId(driveId);  // Link OAuthCredential to the StorageDrive
        credential.setEmail(userEmail); // Fetched user email
        credential.setAccessToken(accessToken); // Fetched access token
        credential.setRefreshToken(refreshToken); // Fetched refresh token
        credential.setExpiresAt(Instant.now().plusSeconds(3600)); // Assuming token expires in 1 hour.

        oAuthCredentialRepository.save(credential); // Save OAuthCredential to DB
    }

    /**
     * Fetch user's email from drive using access token.
     */
    private String fetchDriveUserEmail(String accessToken, String provider, String userInfoUrl) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<?> request = new HttpEntity<>(headers);

        ResponseEntity<String> response = restTemplate.exchange(userInfoUrl, HttpMethod.GET, request, String.class);
        JsonObject userInfo = new Gson().fromJson(response.getBody(), JsonObject.class);

        if (GOOGLE.equalsIgnoreCase(provider)) {
            return userInfo.get("email").getAsString();
        } else if (ONEDRIVE.equalsIgnoreCase(provider)) {
            return userInfo.get("userPrincipalName").getAsString();
        } else {
            throw new RuntimeException("Unsupported provider: " + provider);
        }
    }

    /**
     * Extract access token from response body.
     */
    private String extractAccessTokenFromResponse(String responseBody) {
        JsonObject jsonResponse = new Gson().fromJson(responseBody, JsonObject.class);
        if (jsonResponse.has("access_token")) {
            return jsonResponse.get("access_token").getAsString();
        } else {
            throw new RuntimeException("Access token not found in the response.");
        }
    }

    /**
     * Extract refresh token from response body.
     */
    private String getRefreshTokenFromResponse(String responseBody) {
        JsonObject jsonResponse = new Gson().fromJson(responseBody, JsonObject.class);
        if (jsonResponse.has("refresh_token")) {
            return jsonResponse.get("refresh_token").getAsString();
        } else {
            throw new RuntimeException("Refresh token not found in the response.");
        }
    }

    /**
     * Get StorageDrive by driveId.
     */
    public StorageDrive getStorageDrive(Integer driveId) {
        return storageDriveRepository.findById(driveId)
                .orElseThrow(() -> new RuntimeException("StorageDrive not found for driveId: " + driveId));
    }
}
