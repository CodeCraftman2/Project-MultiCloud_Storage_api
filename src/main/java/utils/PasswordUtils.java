package utils;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordUtils {

    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // Hash a plain-text password
    public static String hashPassword(String plainPassword) {
        return encoder.encode(plainPassword);
    }

    // Verify if a plain-text password matches the hashed password
    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        return encoder.matches(plainPassword, hashedPassword);
    }
    
}

