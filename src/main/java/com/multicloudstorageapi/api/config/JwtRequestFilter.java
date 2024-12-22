package com.multicloudstorageapi.api.config;

import java.io.IOException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.multicloudstorageapi.api.services.TokenManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * The JwtRequestFilter ensures that every incoming request uses a valid OAuth token.
 * If the token is expired, it automatically refreshes the token using the refresh token.
 */
@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private TokenManagementService tokenManagementService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try{           
            Integer userId = extractUserIdFromRequest(request);		// Extract userId and driveId from the request
            Integer driveId = extractDriveIdFromRequest(request);            
            String refreshedToken = tokenManagementService.checkAndRefreshToken(userId, driveId);	// Automatically refresh the token and retrieve the refreshed token
            response.setHeader("Authorization", "Bearer " + refreshedToken);	// Add the new token to the response headers for downstream services

        } 
        catch (Exception e) {            
            response.setHeader("Error", e.getMessage());	// Log the error and continue the filter chain
        }
        
        filterChain.doFilter(request, response);	// Continue with the filter chain
    }
    
    // Helper method to extract userId from the request (e.g., from URL or headers) 
    private Integer extractUserIdFromRequest(HttpServletRequest request) {
        return Integer.parseInt(request.getHeader("userId")); // Example: Extract userId from the request header
    }

    //  Helper method to extract driveId from the request (e.g., from URL or headers)
    private Integer extractDriveIdFromRequest(HttpServletRequest request) {
        return Integer.parseInt(request.getHeader("driveId")); // Example: Extract driveId from the request header
    }
}
