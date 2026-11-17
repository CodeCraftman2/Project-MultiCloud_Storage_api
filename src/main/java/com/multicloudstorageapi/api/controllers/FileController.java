package com.multicloudstorageapi.api.controllers;

import com.google.api.services.drive.model.File;
import com.microsoft.graph.models.DriveItem;
import com.multicloudstorageapi.api.services.GoogleDriveService;
import com.multicloudstorageapi.api.services.OneDriveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Logger log = LoggerFactory.getLogger(FileController.class);

    @Autowired
    private GoogleDriveService googleDriveService;

    @Autowired
    private OneDriveService oneDriveService;

    /**
     * Lists Google Drive files for the user, in the same shape the frontend table uses.
     */
    @GetMapping("/google/files")
    public ResponseEntity<?> listGoogleDriveFiles(@RequestParam Integer userId) {
        try {
            List<File> files = googleDriveService.listFiles(userId);
            List<Map<String, Object>> result = new ArrayList<>();
            if (files != null) {
                for (File f : files) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("storagePath", f.getId());
                    row.put("fileName", f.getName());
                    row.put("fileType", f.getMimeType());
                    row.put("fileSize", f.getSize() != null ? f.getSize() : 0);
                    row.put("createdAt", f.getCreatedTime() != null ? f.getCreatedTime().toStringRfc3339() : null);
                    result.add(row);
                }
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return errorResponse("Google Drive", e);
        }
    }

    /**
     * Lists OneDrive files (root folder) for the user, in the same shape the frontend table uses.
     */
    @GetMapping("/onedrive/files")
    public ResponseEntity<?> listOneDriveFiles(@RequestParam Integer userId) {
        try {
            List<Map<String, Object>> items = oneDriveService.listFiles(userId);
            List<Map<String, Object>> result = new ArrayList<>();
            for (Map<String, Object> item : items) {
                Map<String, Object> row = new LinkedHashMap<>();
                Object file = item.get("file");
                row.put("storagePath", item.get("id"));
                row.put("fileName", item.get("name"));
                row.put("fileType", item.get("folder") != null ? "folder"
                        : (file instanceof Map<?, ?> m && m.get("mimeType") != null ? m.get("mimeType") : "file"));
                row.put("fileSize", item.get("size") != null ? item.get("size") : 0);
                row.put("createdAt", item.get("createdDateTime"));
                result.add(row);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return errorResponse("OneDrive", e);
        }
    }

    /** 400 for "not logged in / not connected", 500 for anything else; always with a readable message. */
    private ResponseEntity<Map<String, String>> errorResponse(String drive, Exception e) {
        boolean userError = e instanceof IllegalArgumentException || e instanceof IllegalStateException;
        if (!userError) {
            log.error("Error listing {} files", drive, e);
        }
        return ResponseEntity.status(userError ? 400 : 500)
                .body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
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
