package com.multicloudstorageapi.api.services;

import com.google.api.client.http.InputStreamContent;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.FileList;
import com.multicloudstorageapi.api.config.GoogleDriveConfig;
import com.multicloudstorageapi.api.entities.File;
import com.multicloudstorageapi.api.repositories.FileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class GoogleDriveService {

    @Autowired
    private GoogleDriveConfig googleDriveConfig;

    @Autowired
    private FileRepository fileRepository;

    private static final Integer GOOGLE_DRIVE_ID = 1;

    /**
     * List all files in Google Drive for the authenticated user.
     */
    public List<com.google.api.services.drive.model.File> listFiles(Integer userId) throws Exception {
        Drive googleDrive = googleDriveConfig.getDriveForCurrentUser();
        FileList result = googleDrive.files()
                .list()
                .setFields("files(id, name, mimeType, size)")
                .execute();
        return result.getFiles();
    }

    /**
     * Upload a file to Google Drive.
     */
    public com.google.api.services.drive.model.File uploadFile(MultipartFile file, Integer userId) throws Exception {
        Drive googleDrive = googleDriveConfig.getDriveForCurrentUser();

        com.google.api.services.drive.model.File fileMetadata = new com.google.api.services.drive.model.File();
        fileMetadata.setName(file.getOriginalFilename());

        InputStreamContent mediaContent = new InputStreamContent(file.getContentType(), file.getInputStream());
        com.google.api.services.drive.model.File uploadedFile = googleDrive.files()
                .create(fileMetadata, mediaContent)
                .setFields("id, name, mimeType, size")
                .execute();

        // Save metadata to the database
        File dbFile = new File();
        dbFile.setFileName(uploadedFile.getName());
        dbFile.setStoragePath(uploadedFile.getId());
        dbFile.setFileSize(uploadedFile.getSize() != null ? uploadedFile.getSize() : 0);
        dbFile.setDriveId(GOOGLE_DRIVE_ID);
        dbFile.setFileType(uploadedFile.getMimeType());
        dbFile.setUserId(userId);
        fileRepository.save(dbFile);

        return uploadedFile;
    }

    /**
     * Delete a file from Google Drive.
     */
    public void deleteFile(String storagePath, Integer userId) throws Exception {
        Drive googleDrive = googleDriveConfig.getDriveForCurrentUser();
        googleDrive.files().delete(storagePath).execute();

        fileRepository.findByStoragePathAndUserId(storagePath, userId).ifPresent(fileRepository::delete);
    }

    /**
     * Download a file from Google Drive.
     */
    public byte[] downloadFile(String storagePath, Integer userId) throws Exception {
        Drive googleDrive = googleDriveConfig.getDriveForCurrentUser();

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        googleDrive.files().get(storagePath).executeMediaAndDownloadTo(outputStream);
        return outputStream.toByteArray();
    }
}
