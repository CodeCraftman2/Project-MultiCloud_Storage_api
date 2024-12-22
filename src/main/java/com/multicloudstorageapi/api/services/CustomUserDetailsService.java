package com.multicloudstorageapi.api.services;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;

import com.multicloudstorageapi.api.entities.CustomUserDetails;
import com.multicloudstorageapi.api.entities.User;
import com.multicloudstorageapi.api.repositories.UserRepository;


@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Fetch the user from the database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Return CustomUserDetails object
        return new CustomUserDetails(
                user.getUsername(),
                user.getPasswordHash(), // Use the hashed password stored in the database
                user.getUserId()        // Include userId
        );
    }
}
