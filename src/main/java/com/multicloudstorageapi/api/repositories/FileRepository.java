package com.multicloudstorageapi.api.repositories;

import com.multicloudstorageapi.api.entities.File;
import com.multicloudstorageapi.api.entities.User;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<File, Integer> {

	// Retrieve a file by primary key (file_id)
    Optional<File> findById(Integer fileId);
    
    // Find files by user and drive
    List<File> findByUserIdAndDriveId(Integer userId, Integer driveId);

    // Find files in a specific folder
    List<File> findByFolderId(Integer folderId);

    // Find files by name within a folder
    List<File> findByFolderIdAndFileName(Integer folderId, String fileName);

    // Find files larger than a specific size
    List<File> findByFileSizeGreaterThan(Long size);

    // Find files by type (e.g., images, PDFs)
    List<File> findByFileType(String fileType);

	Optional<File> findByStoragePathAndDriveId(String fileId, Integer driveId);

	Optional<File> findByStoragePathAndUserId(String storagePath, Integer userId);

	List<File> findByUserId(Integer userId);

	Optional<File> findByFileIdAndUserId(Integer fileId, Integer userId); 
}

