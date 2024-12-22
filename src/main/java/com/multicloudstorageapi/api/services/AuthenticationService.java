package com.multicloudstorageapi.api.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.multicloudstorageapi.api.entities.User;
import com.multicloudstorageapi.api.repositories.UserRepository;

import utils.PasswordUtils;

@Service
public class AuthenticationService {

    @Autowired
    private UserRepository userRepository;

    public boolean authenticate(String username, String password) {
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            // Verify password (assuming passwords are hashed in the database)
            return PasswordUtils.verifyPassword(password, user.getPasswordHash());
        }
        return false;
    }

}
