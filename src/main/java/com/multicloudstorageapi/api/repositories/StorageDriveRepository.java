package com.multicloudstorageapi.api.repositories;

import com.multicloudstorageapi.api.entities.StorageDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StorageDriveRepository extends JpaRepository<StorageDrive, Integer> {

	// Retrieve a storage drive by primary key (drive_id)
    Optional<StorageDrive> findById(Integer driveId);
    
    // Find drive by name (e.g., Google Drive, OneDrive)
    Optional<StorageDrive> findByDriveName(String driveName);
}
