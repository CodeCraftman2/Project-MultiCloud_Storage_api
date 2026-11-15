package com.multicloudstorageapi.api.controllers;

import jakarta.servlet.http.*;
import utils.SecurityContextUtil;

import com.multicloudstorageapi.api.services.TokenManagementService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
public class OAuthController {

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

    private final TokenManagementService tokenManagementService;

    public OAuthController(TokenManagementService tokenManagementService) {
        this.tokenManagementService = tokenManagementService;
    }

    /**
     * Redirects the user to the Google OAuth consent screen.
     */
    @GetMapping("/oauth/google")
    public void initiateGoogleOAuth(@RequestParam(value = "userId", required = false) Integer userId,
                                    HttpServletResponse response) throws IOException {
        String authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth?"
            // openid + email are required so the userinfo endpoint can return the account email
            + "scope=openid%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive"
            + "&access_type=offline"
            + "&prompt=consent"
            + "&include_granted_scopes=true"
            + "&response_type=code"
            + "&redirect_uri=" + googleRedirectUri
            + "&client_id=" + googleClientId
            + (userId != null ? "&state=" + userId : "");

        response.sendRedirect(authorizationUrl);
    }

    /**
     * Redirects the user to the OneDrive OAuth consent screen.
     */
    @GetMapping("/oauth/onedrive")
    public void initiateOneDriveOAuth(@RequestParam(value = "userId", required = false) Integer userId,
                                      HttpServletResponse response) throws IOException {
        String authorizationUrl = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?"
            + "scope=openid%20User.Read%20Files.ReadWrite.All%20offline_access"
            + "&response_type=code"
            + "&redirect_uri=" + microsoftRedirectUri
            + "&client_id=" + microsoftClientId
            + (userId != null ? "&state=" + userId : "");

        response.sendRedirect(authorizationUrl);
    }

    /**
     * Callback end point for Google OAuth flow. Exchanges authorization code for access token.
     */
    @GetMapping("/oauth/google/callback")
    public ResponseEntity<String> googleCallback(@RequestParam("code") String authorizationCode,
                                                 @RequestParam(value = "state", required = false) Integer stateUserId) {
        try {
            Integer userId = resolveUserId(stateUserId);
            tokenManagementService.handleAuthorization(authorizationCode, userId, "Google Drive");
            return ResponseEntity.ok("Google authorization successful");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error during Google authorization: " + e.getMessage());
        }
    }

    /**
     * Callback end point for OneDrive OAuth flow. Exchanges authorization code for access token.
     */
    @GetMapping("/oauth/onedrive/callback")
    public ResponseEntity<String> oneDriveCallback(@RequestParam("code") String authorizationCode,
                                                   @RequestParam(value = "state", required = false) Integer stateUserId) {
        try {
            Integer userId = resolveUserId(stateUserId);
            tokenManagementService.handleAuthorization(authorizationCode, userId, "OneDrive");
            return ResponseEntity.ok("OneDrive authorization successful");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Error during OneDrive authorization: " + e.getMessage());
        }
    }

    /**
     * The OAuth provider redirects back without our auth header, so the user id travels
     * in the OAuth "state" param (set by /oauth/google?userId=X). Falls back to the
     * security context, then to the original hard-coded id 4.
     */
    private Integer resolveUserId(Integer stateUserId) {
        if (stateUserId != null) {
            return stateUserId;
        }
        try {
            return SecurityContextUtil.extractUserIdFromSecurityContext();
        } catch (Exception e) {
            return 4;
        }
    }
}
 