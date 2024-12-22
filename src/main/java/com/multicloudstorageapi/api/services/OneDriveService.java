package com.multicloudstorageapi.api.services;

import com.microsoft.graph.models.DriveItem;
import com.multicloudstorageapi.api.entities.OAuthCredential;
import com.multicloudstorageapi.api.repositories.OAuthCredentialRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class OneDriveService {

    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private OAuthCredentialRepository oAuthCredentiaRepository;

    private String oneDriveBaseUrl = "https://graph.microsoft.com/v1.0";

    // List files and folders from OneDrive
    public List<DriveItem> listFiles(Integer userId) {
        String url = oneDriveBaseUrl + "/me/drive/root/children";
        return makeRequest(url, HttpMethod.GET, null, userId, List.class);
    }

    // Upload a file to OneDrive
    public DriveItem uploadFile(MultipartFile file, Integer userId) throws IOException {
        String url = oneDriveBaseUrl + "/me/drive/root:/" + file.getOriginalFilename() + ":/content";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(getAccessToken(userId));
        HttpEntity<byte[]> request = new HttpEntity<>(file.getBytes(), headers);
        return makeRequest(url, HttpMethod.PUT, request, userId, DriveItem.class);
    }

    // Delete a file from OneDrive
    public String deleteFile(String fileId, Integer userId) {
        String url = oneDriveBaseUrl + "/me/drive/items/" + fileId;
        return makeRequest(url, HttpMethod.DELETE, null, userId, String.class);
    }

    // Download a file from OneDrive
    public byte[] downloadFile(String fileId, Integer userId) {
        String url = oneDriveBaseUrl + "/me/drive/items/" + fileId + "/content";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(getAccessToken(userId));
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        ResponseEntity<byte[]> response = restTemplate.exchange(url, HttpMethod.GET, entity, byte[].class);
        return response.getBody();
    }

    // Helper method to make API requests
    private <T> T makeRequest(String url, HttpMethod method, HttpEntity<?> entity, Integer userId, Class<T> responseType) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(getAccessToken(userId));
        
        if (entity == null) {
            entity = new HttpEntity<>(headers);
        }
        
        ResponseEntity<T> response = restTemplate.exchange(url, method, entity, responseType);
        return response.getBody();
    }

    // Get access token for the user
    private String getAccessToken(Integer userId) {
        Optional<OAuthCredential> optionalCredential = oAuthCredentiaRepository.findByUserId(userId);
        return optionalCredential.map(OAuthCredential::getAccessToken)
                                 .orElseThrow(() -> new RuntimeException("Access token not found"));
    }
}


/*import com.microsoft.graph.models.DriveItem;
import com.microsoft.graph.requests.DriveItemCollectionPage;
import com.microsoft.graph.requests.GraphServiceClient;
import com.microsoft.graph.authentication.IAuthenticationProvider;
import com.microsoft.graph.auth.confidentialClient.ClientCredentialProvider;
import com.microsoft.graph.auth.enums.NationalCloud;
import com.multicloudstorageapi.api.entities.File;
import com.multicloudstorageapi.api.entities.OAuthCredential;
import com.multicloudstorageapi.api.repositories.FileRepository;
import com.multicloudstorageapi.api.repositories.OAuthCredentialRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Collections;
import java.util.List;

@Service
public class OneDriveService {

    private final GraphServiceClient<?> graphClient;
    private final OAuthCredentialRepository oAuthCredentialRepository;
    private final FileRepository fileRepository;

    public OneDriveService(
            @Value("${spring.security.oauth2.client.registration.onedrive.client-id}") String clientId,
            @Value("${spring.security.oauth2.client.registration.onedrive.client-secret}") String clientSecret,
            @Value("${microsoft.tenant-id}") String tenantId,
            OAuthCredentialRepository oAuthCredentialRepository,
            FileRepository fileRepository
    ) {
        ClientCredentialProvider authProvider = new ClientCredentialProvider(
                clientId,
                Collections.singletonList("https://graph.microsoft.com/.default"),
                clientSecret,
                "https://login.microsoftonline.com/" + tenantId,
                NationalCloud.Global
        );
        IAuthenticationProvider auth = null; //(IAuthenticationProvider )authProvider;
        this.graphClient = GraphServiceClient.builder().authenticationProvider(auth).buildClient();
        this.oAuthCredentialRepository = oAuthCredentialRepository;
        this.fileRepository = fileRepository;
    }

    
     //List all files and folders from OneDrive.
     
    public List<DriveItem> listFiles(Integer userId) {
        DriveItemCollectionPage items = graphClient.me().drive().root().children().buildRequest().get();
        return items.getCurrentPage();
    }

   
     // Upload a file to OneDrive and save metadata to the database.
     
    public DriveItem uploadFile(MultipartFile file, Integer userId) throws Exception {
        // Validate user credentials
        OAuthCredential credential = getOAuthCredential(userId);

        // Upload file to OneDrive
        byte[] fileStream = file.getBytes();
        DriveItem uploadedFile = graphClient.me().drive().root()
                .itemWithPath(file.getOriginalFilename())
                .content()
                .buildRequest()
                .put(fileStream);

        // Save file metadata to database
        File dbFile = new File();
        dbFile.setUserId(userId);
        dbFile.setDriveId(credential.getDriveId());
        dbFile.setFileName(uploadedFile.name);
        dbFile.setStoragePath(uploadedFile.id);
        dbFile.setFileSize(file.getSize());
        dbFile.setFileType(file.getContentType());

        fileRepository.save(dbFile);

        return uploadedFile;
    }

    
    // Delete a file from OneDrive and remove metadata from the database.
    
    public void deleteFile(String storagePath, Integer userId) {
        // Validate user credentials
        OAuthCredential credential = getOAuthCredential(userId);

        // Delete file from OneDrive
        graphClient.me().drive().items(storagePath).buildRequest().delete();

        // Remove metadata from database
        fileRepository.findByStoragePathAndDriveId(storagePath, credential.getDriveId())
                .ifPresent(fileRepository::delete);
    }

    
    // Download a file from OneDrive.
     
    public byte[] downloadFile(String storagePath, Integer userId) throws Exception {
        InputStream inputStream = graphClient.me().drive().items(storagePath).content().buildRequest().get();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        inputStream.transferTo(outputStream);
        return outputStream.toByteArray();
    }

   
     // Fetch OAuthCredential for a user.
     
    private OAuthCredential getOAuthCredential(Integer userId) {
        return oAuthCredentialRepository.findByUserIdAndDriveId(userId, 2)
                .orElseThrow(() -> new RuntimeException("No credentials found for userId: " + userId + " and driveId: 2"));
    }
}
*/

/*
import com.microsoft.graph.models.DriveItem;
import com.microsoft.graph.requests.GraphServiceClient;
import com.microsoft.graph.auth.confidentialClient.ConfidentialClientApplication;
import com.microsoft.graph.auth.confidentialClient.ClientCredentialProvider;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.Optional;

@Service
public class OneDriveService {

    @Autowired
    private RestTemplate restTemplate;

    private String oneDriveBaseUrl = "https://graph.microsoft.com/v1.0";

    // List files from OneDrive
    public List<DriveItem> listFiles(Integer userId) {
        String url = oneDriveBaseUrl + "/me/drive/root/children";
        return makeRequest(url, HttpMethod.GET, null, userId);
    }

    // Upload file to OneDrive
    public String uploadFile(String fileName, byte[] fileData, Integer userId) {
        String url = oneDriveBaseUrl + "/me/drive/root:/" + fileName + ":/content";
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(getAccessToken(userId));
        HttpEntity<byte[]> request = new HttpEntity<>(fileData, headers);
        return makeRequest(url, HttpMethod.PUT, request, userId);
    }

    // Delete file from OneDrive
    public String deleteFile(String fileId, Integer userId) {
        String url = oneDriveBaseUrl + "/me/drive/items/" + fileId;
        return makeRequest(url, HttpMethod.DELETE, null, userId);
    }

    // Helper method to make API requests
    private String makeRequest(String url, HttpMethod method, HttpEntity<?> entity, Integer userId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(getAccessToken(userId));

        if (entity == null) {
            entity = new HttpEntity<>(headers);
        }
        
        ResponseEntity<String> response = restTemplate.exchange(url, method, entity, String.class);
        return response.getBody();
    }

    // Get access token for the user
    private String getAccessToken(Integer userId) {
        // You would fetch the access token from your OAuthCredential repository based on the userId
        Optional<OAuthCredential> optionalCredential = oAuthCredentialRepository.findByUserId(userId);
        return optionalCredential.map(OAuthCredential::getAccessToken).orElseThrow(() -> new RuntimeException("Access token not found"));
    }
}
*/