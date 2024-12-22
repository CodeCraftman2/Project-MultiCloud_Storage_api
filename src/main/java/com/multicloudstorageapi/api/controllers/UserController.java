package com.multicloudstorageapi.api.controllers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.multicloudstorageapi.api.entities.File;
import com.multicloudstorageapi.api.entities.LoginRequest;
import com.multicloudstorageapi.api.entities.OAuthCredential;
import com.multicloudstorageapi.api.entities.UpdateUser;
import com.multicloudstorageapi.api.entities.User;
import com.multicloudstorageapi.api.repositories.FileRepository;
import com.multicloudstorageapi.api.repositories.OAuthCredentialRepository;
import com.multicloudstorageapi.api.repositories.UserRepository;
import com.multicloudstorageapi.api.services.AuthenticationService;

import utils.PasswordUtils;


@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileRepository fileRepository;
    
    @Autowired
    private OAuthCredentialRepository oAuthCredentialRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
    	Map<String,Object> response = new HashMap<>();
    	try {
	        String plainPassword = user.getPasswordHash(); 
	        String hashedPassword = PasswordUtils.hashPassword(plainPassword);
	        user.setPasswordHash(hashedPassword); 
	        userRepository.save(user);
	        
	        response.put("isSuccess", true);
	        response.put("message", "User registered successfully!");
	        return ResponseEntity.ok(response); 
    	}
    	catch(Exception e)
    	{
    		response.put("isSuccess", false);
    		response.put("message", "Username or Email Already Exists!");
    		return ResponseEntity.ok(response);  
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Integer userId,@RequestBody UpdateUser user) {
    	Map<String,Object> response = new HashMap<>();
    	Optional<User> optUser = userRepository.findById(userId);
    	if(optUser.isPresent())
    	{
    		User updateduser = optUser.get();
    		updateduser.setUsername(user.getUsername());
    		updateduser.setEmail(user.getEmail());
    		String plainPassword = user.getPasswordHash(); 
	        String hashedPassword = PasswordUtils.hashPassword(plainPassword);
    		updateduser.setPasswordHash(hashedPassword);
    		userRepository.save(updateduser);
    		response.put("isUpdated",true);
    		return ResponseEntity.ok(response);
    	}
        
    	else {
    		response.put("isUpdated", false);
    		return ResponseEntity.ok(response);
    	}
    }
    
    @GetMapping("/myfiles")
    public List<File> getMyFiles(@RequestParam Integer userId){
    	return fileRepository.findByUserId(userId);	
    }
    
    @DeleteMapping("/myfiles/delete")
    public void deleteMyFile(@RequestParam Integer fileId, @RequestParam Integer userId )
    {
    		Optional<File> optFile = fileRepository.findByFileIdAndUserId(fileId, userId);
    		optFile.ifPresent(fileRepository::delete); 
    }
    
    @GetMapping("/all")
    public List<User> getAllUsers() {
        return userRepository.findAll(); // Directly fetching all users from the repository
    }
    
    @GetMapping("/currentuser")
    public ResponseEntity<User> getCurrentUser(@RequestParam Integer userId){
    	Optional<User> optUser = userRepository.findById(userId);
    	if(optUser.isPresent()) {
    		User user = optUser.get();
    		return ResponseEntity.ok(user);
    	}
    	else {
    		return ResponseEntity.ok(null); 
    	}
    }
    
    @GetMapping("/tokens")
    public ResponseEntity<?> getUserAccessToken(@RequestParam Integer userId, @RequestParam Integer driveId){
    	Map<String,Object> response = new HashMap<>();
    	Optional<OAuthCredential> optionalCredentials = oAuthCredentialRepository.findByUserIdAndDriveId(userId, driveId);
    	if(optionalCredentials.isPresent()) {
    		OAuthCredential credentials = optionalCredentials.get();
    		response.put("isExist", true);
    		response.put("accesstoken", credentials.getAccessToken());
    		response.put("refreshtoken", credentials.getRefreshToken());
    		response.put("email", credentials.getEmail());
    		return ResponseEntity.ok(response); 
    	}
    	else {
    		response.put("isExist", false);
    		response.put("message", "Tokens Not Found!");
    		return ResponseEntity.ok(response); 
    	}
    	
    }

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    	Optional<User> optionalUser = userRepository.findByUsername(loginRequest.getUsername());
    	if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // Verify password
            boolean isAuthenticated = authenticationService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());

            if (isAuthenticated) {
               
                // Create the response
                Map<String, Object> response = new HashMap<>();
                response.put("isAuthenticated", true);
                response.put("userId", user.getUserId());

                return ResponseEntity.ok(response);
            }
            else {
            	Map<String, Object> response = new HashMap<>();
                response.put("isAuthenticated", false);
                response.put("message", "Invalid Credentials!"); 
                return ResponseEntity.ok(response);
            }
        }
    	else {
    		Map<String, Object> response = new HashMap<>(); 
            response.put("isAuthenticated", false);
            response.put("message", "User Not Found!"); 
            return ResponseEntity.ok(response);
        }
    }

}
