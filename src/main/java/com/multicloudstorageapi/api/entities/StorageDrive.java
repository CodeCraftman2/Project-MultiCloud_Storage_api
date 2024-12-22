package com.multicloudstorageapi.api.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "Pavan_StorageDrives")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StorageDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "drive_id")
    private Integer driveId;

    @Column(name = "drive_name", nullable = false, unique = true, length = 50)
    private String driveName;

    @Column(name = "base_url", nullable = false, length = 255)
    private String baseUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

	public Integer getDriveId() {
		return driveId;
	}

	public void setDriveId(Integer driveId) {
		this.driveId = driveId;
	}

	public String getDriveName() {
		return driveName;
	}

	public void setDriveName(String driveName) {
		this.driveName = driveName;
	}

	public String getBaseUrl() {
		return baseUrl;
	}

	public void setBaseUrl(String baseUrl) {
		this.baseUrl = baseUrl;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}

