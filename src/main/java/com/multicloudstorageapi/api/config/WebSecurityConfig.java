package com.multicloudstorageapi.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.AuthorizationGrantType;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private WebCorsConfig corsConfig;  // Inject CorsConfig

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

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManagerBean(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = 
                http.getSharedObject(AuthenticationManagerBuilder.class);

        authenticationManagerBuilder
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder());

        return authenticationManagerBuilder.build();
    }

    @Bean
    @Primary
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))  // Enable CORS
            .csrf(csrf -> csrf.disable())  // Disable CSRF for state-less APIs
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/users/register", "/users/login", "/oauth/google", "/oauth/onedrive", "/users/myfiles","/oauth/google","/oauth/onedrive",
                		"/oauth/google/callback", "/oauth/onedrive/callback" ,"/users/all", "/users/tokens","/users/currentuser","/users/update/{id}").permitAll()  // Public endpoints
                .anyRequest().authenticated())  // Require authentication for all other endpoints
            .exceptionHandling(exceptions -> 
                exceptions.authenticationEntryPoint(jwtAuthenticationEntryPoint))  // Custom JWT entry point
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // State-less session
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
            .oauth2Login(oauth -> oauth
                .loginPage("/login")
                .clientRegistrationRepository(clientRegistrationRepository())
            );

        return http.build();
    }

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository(googleClientRegistration(), onedriveClientRegistration());
    }

    private ClientRegistration googleClientRegistration() {
        return ClientRegistration.withRegistrationId("google")
            .clientId(googleClientId)
            .clientSecret(googleClientSecret)
            .scope("openid", "profile", "email", "https://www.googleapis.com/auth/drive")
            .redirectUri(googleRedirectUri)
            .authorizationUri(googleAuthUri)
            .tokenUri(googleTokenUri)
            .userInfoUri(googleUserInfoUri)
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .build();
    }

    private ClientRegistration onedriveClientRegistration() {
        return ClientRegistration.withRegistrationId("onedrive")
            .clientId(microsoftClientId)
            .clientSecret(microsoftClientSecret)
            .scope("Files.ReadWrite.All", "offline_access")
            .redirectUri(microsoftRedirectUri)
            .authorizationUri(microsoftAuthUri)
            .tokenUri(microsoftTokenUri)
            .userInfoUri(microsoftUserInfoUri)
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .build();
    }
}


/*import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.AuthorizationGrantType;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Autowired
    private WebCorsConfig corsConfig;  // Inject CorsConfig
    
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

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManagerBean(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = 
                http.getSharedObject(AuthenticationManagerBuilder.class);

        authenticationManagerBuilder
                .userDetailsService(userDetailsService)
                .passwordEncoder(passwordEncoder());

        return authenticationManagerBuilder.build();
    }

    @Bean
    @Primary 
    public HttpSecurity httpSecurity(HttpSecurity http) throws Exception {
        return http
            .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))  // Enable CORS
            .csrf(csrf -> csrf.disable())  // Disable CSRF for state-less APIs
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/register", "/login", "/oauth2/callback/google", "/oauth2/callback/onedrive", "/listallusersfromdb").permitAll()  // Public endpoints
                .anyRequest().authenticated())  // Require authentication for all other endpoints
            .exceptionHandling(exceptions -> 
                exceptions.authenticationEntryPoint(jwtAuthenticationEntryPoint))  // Custom JWT entry point
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // State-less session
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
            .oauth2Login(oauth -> oauth
                .loginPage("/login")
                .clientRegistrationRepository(clientRegistrationRepository())
            );
    }

    @Bean
    public SecurityFilterChain oauth2SecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/register", "/login", "/oauth2/callback/google", "/oauth2/callback/onedrive", "/listallusersfromdb").permitAll()  // Public endpoints
                .anyRequest().authenticated())  // Require authentication for other endpoints
            .exceptionHandling(exceptions -> 
                exceptions.authenticationEntryPoint(jwtAuthenticationEntryPoint))  // Custom JWT entry point
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // State-less session
            .oauth2Login(oauth -> oauth
                .loginPage("/login")
                .clientRegistrationRepository(clientRegistrationRepository())
            );

        return http.build();
    }

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository(googleClientRegistration(), onedriveClientRegistration());
    }

    private ClientRegistration googleClientRegistration() {
        return ClientRegistration.withRegistrationId("google")
            .clientId(googleClientId)
            .clientSecret(googleClientSecret)
            .scope("openid", "profile", "email", "https://www.googleapis.com/auth/drive")
            .redirectUri(googleRedirectUri)
            .authorizationUri(googleAuthUri)
            .tokenUri(googleTokenUri)
            .userInfoUri(googleUserInfoUri)
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .build();
    }

    private ClientRegistration onedriveClientRegistration() {
        return ClientRegistration.withRegistrationId("onedrive")
            .clientId(microsoftClientId)
            .clientSecret(microsoftClientSecret)
            .scope("Files.ReadWrite.All", "offline_access")
            .redirectUri(microsoftRedirectUri)
            .authorizationUri(microsoftAuthUri)
            .tokenUri(microsoftTokenUri)
            .userInfoUri(microsoftUserInfoUri)
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .build();
    }
}
*/