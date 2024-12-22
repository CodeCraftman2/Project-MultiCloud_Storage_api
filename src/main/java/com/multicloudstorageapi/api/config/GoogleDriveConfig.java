package com.multicloudstorageapi.api.config;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import com.multicloudstorageapi.api.entities.OAuthCredential;
import com.multicloudstorageapi.api.repositories.OAuthCredentialRepository;
import com.multicloudstorageapi.api.services.TokenManagementService;
import utils.SecurityContextUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Date;

@Component
public class GoogleDriveConfig {

    @Autowired
    private OAuthCredentialRepository oAuthCredentialRepository;

    @Autowired
    private TokenManagementService tokenManagementService;

    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    /**
     * Creates a Google Drive client dynamically for the authenticated user.
     *
     * @return a configured Drive instance.
     * @throws Exception if credentials are invalid or the token refresh fails.
     */
    public Drive getDriveForCurrentUser() throws Exception {
        Integer userId = SecurityContextUtil.extractUserIdFromSecurityContext();

        if (userId == null) {
            throw new RuntimeException("User not authenticated or invalid principal.");
        }

        // Fetch OAuth credentials for the user
        OAuthCredential credentials = oAuthCredentialRepository.findByUserIdAndDriveId(userId, 1)
                .orElseThrow(() -> new RuntimeException("No Google Drive credentials found for user ID: " + userId));

        // Check if the token is expired and refresh it if necessary
        if (isTokenExpired(credentials)) {
            refreshAccessToken(credentials, userId);
        }

        // Create GoogleCredentials dynamically with the updated token
        GoogleCredentials googleCredentials = GoogleCredentials.create(
                new AccessToken(credentials.getAccessToken(), Date.from(credentials.getExpiresAt()))
        ).createScoped(Collections.singletonList("https://www.googleapis.com/auth/drive"));

        // Initialize the Google Drive API client
        return new Drive.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                JSON_FACTORY,
                new HttpCredentialsAdapter(googleCredentials)
        ).setApplicationName("Multi Cloud Storage").build();
    }

    /**
     * Checks if the user's access token has expired.
     *
     * @param credentials the OAuth credentials from the database.
     * @return true if the token has expired; false otherwise.
     */
    private boolean isTokenExpired(OAuthCredential credentials) {
        return credentials.getExpiresAt().isBefore(java.time.Instant.now());
    }

    /**
     * Refreshes the access token for the given OAuth credentials.
     *
     * @param credentials the OAuth credentials to refresh.
     * @param userId      the user ID associated with the credentials.
     */
    private void refreshAccessToken(OAuthCredential credentials, Integer userId) {
        try {
            String newAccessToken = tokenManagementService.checkAndRefreshToken(userId, 1); // Drive ID = 1 for Google Drive
            credentials.setAccessToken(newAccessToken);
            credentials.setExpiresAt(java.time.Instant.now().plusSeconds(3600)); // Assume 1-hour validity
            oAuthCredentialRepository.save(credentials);
        } catch (Exception e) {
            throw new RuntimeException("Failed to refresh access token: " + e.getMessage(), e);
        }
    }
}

