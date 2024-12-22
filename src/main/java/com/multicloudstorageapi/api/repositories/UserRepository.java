package com.multicloudstorageapi.api.repositories;

import com.multicloudstorageapi.api.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {

	// Retrieve a user by primary key (user_id)
    Optional<User> findById(Integer userId);
    
    // Find user by user name
    Optional<User> findByUsername(String username);

    // Find user by email
    Optional<User> findByEmail(String email);

    // Check if a user exists by email
    boolean existsByEmail(String email);
}
