package com.multicloudstorageapi.api.repositories;

import com.multicloudstorageapi.api.entities.OAuthCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OAuthCredentialRepository extends JpaRepository<OAuthCredential, Integer> {

    // Retrieve OAuth credentials by primary key (id)
    Optional<OAuthCredential> findById(Integer id);
    
    
    Optional<OAuthCredential> findByDriveId(Integer driveId);

    
    Optional<OAuthCredential> findByUserIdAndDriveId(Integer userId, Integer driveId);

    // Find credentials by user
    Optional<OAuthCredential> findByUserId(Integer userId);

    // Find credentials by email (for debugging or management)
    Optional<OAuthCredential> findByEmail(String email);

    // Find credentials expiring soon
    List<OAuthCredential> findByExpiresAtBefore(java.time.LocalDateTime dateTime);
}
