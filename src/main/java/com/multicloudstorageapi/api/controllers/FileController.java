package com.multicloudstorageapi.api.controllers;

import com.google.api.services.drive.model.File;
import com.microsoft.graph.models.DriveItem;
import com.multicloudstorageapi.api.services.GoogleDriveService;
import com.multicloudstorageapi.api.services.OneDriveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private GoogleDriveService googleDriveService;

    @Autowired
    private OneDriveService oneDriveService;

    @GetMapping("/google/files")
    public ResponseEntity<List<File>> listGoogleDriveFiles(@RequestParam Integer userId) {
        try {
            List<File> files = googleDriveService.listFiles(userId);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/onedrive/files")
    public ResponseEntity<List<DriveItem>> listOneDriveFiles(@RequestParam Integer userId) {
        try {
            List<DriveItem> files = oneDriveService.listFiles(userId);
            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/google/upload")
    public ResponseEntity<?> uploadGoogleDriveFile( @RequestParam MultipartFile file, @RequestParam Integer userId) {
        try {
            File uploadedFile = googleDriveService.uploadFile(file, userId);
            return ResponseEntity.ok(uploadedFile);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/onedrive/upload")
    public ResponseEntity<?> uploadOneDriveFile( @RequestParam MultipartFile file, @RequestParam Integer userId) {
        try {
            DriveItem uploadedItem = oneDriveService.uploadFile( file, userId);
            return ResponseEntity.ok(uploadedItem); 
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("/google/delete/{storagePath}")
    public ResponseEntity<?> deleteGoogleDriveFile( @PathVariable String storagePath, @RequestParam Integer userId) {
        try {
            googleDriveService.deleteFile(storagePath, userId);
            return ResponseEntity.ok("File deleted successfully from Google Drive.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage()); 
        } 
    }

    @DeleteMapping("/onedrive/delete/{storagePath}")
    public ResponseEntity<?> deleteOneDriveFile( @PathVariable String storagePath, @RequestParam Integer userId) {
        try {
            oneDriveService.deleteFile(storagePath, userId);
            return ResponseEntity.ok("File deleted successfully from OneDrive.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/google/download/{storagePath}")
    public ResponseEntity<?> downloadGoogleDriveFile( @PathVariable String storagePath, @RequestParam Integer userId) {
        try {
            byte[] fileData = googleDriveService.downloadFile(storagePath, userId);
            return ResponseEntity.ok(fileData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/onedrive/download/{storagePath}")
    public ResponseEntity<?> downloadOneDriveFile( @PathVariable String storagePath, @RequestParam Integer userId) {
        try {
            byte[] fileData = oneDriveService.downloadFile(storagePath, userId);
            return ResponseEntity.ok(fileData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
