package com.multicloudstorageapi.api.repositories;

import com.multicloudstorageapi.api.entities.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FolderRepository extends JpaRepository<Folder, Integer> {

	// Retrieve a folder by primary key (folder_id)
    Optional<Folder> findById(Integer folderId);
    
    // Find folders by user and drive
    List<Folder> findByUserIdAndDriveId(Integer userId, Integer driveId);

    // Find folders by parent folder
    List<Folder> findByParentFolderId(Integer parentFolderId);

    // Find root folders for a user and drive
    List<Folder> findByUserIdAndDriveIdAndParentFolderIdIsNull(Integer userId, Integer driveId);

    // Find folder by name within a specific user and drive
    Optional<Folder> findByUserIdAndDriveIdAndFolderName(Integer userId, Integer driveId, String folderName);
}
