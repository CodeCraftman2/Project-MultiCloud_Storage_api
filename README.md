# Multi-Cloud File Storage Application

A full-stack web app for managing files across several cloud storage providers from one place. Users register, log in, connect their **Google Drive** and **Microsoft OneDrive** accounts with OAuth, and then upload, list, download and delete files on either drive from a single dashboard.

- **Backend:** Spring Boot 3.3 (Java 22), Spring Security with JWT, Spring Data JPA, MySQL
- **Frontend:** Angular 18 with ngx-toastr
- **Cloud integrations:** Google Drive API, Microsoft Graph (OneDrive)

---

## Features

- User registration and login with JWT-based authentication
- Profile view and update
- Connect Google Drive and OneDrive through OAuth 2.0 (tokens are stored per user)
- Upload, list, download and delete files on each connected drive
- A unified "My Files" view of the user's files
- Toast notifications for success and error messages

## Tech Stack

| Layer    | Technology                                                   |
|----------|--------------------------------------------------------------|
| Frontend | Angular 18, TypeScript, RxJS, ngx-toastr                     |
| Backend  | Spring Boot 3.3.6, Spring Security, JWT, Spring Data JPA     |
| Database | MySQL                                                        |
| Cloud    | Google Drive API, Microsoft Graph API (OneDrive)             |
| Build    | Maven (wrapper included), Angular CLI / npm                  |

## Project Structure

```
Project-MultiCloud_Storage_api/
├── src/main/java/com/multicloudstorageapi/api/
│   ├── config/          # Security, JWT, CORS, Google Drive & OneDrive config
│   ├── controllers/     # UserController, FileController, OAuthController
│   ├── entities/        # User, File, Folder, StorageDrive, OAuthCredential, ...
│   ├── repositories/    # Spring Data JPA repositories
│   └── services/        # Auth, GoogleDriveService, OneDriveService, token management
├── src/main/resources/
│   └── application.properties
├── frontend/            # Angular app
│   └── src/app/         # login, register, home, drive, googledrive, onedrive,
│                        # files, profile, about, header, sidebar, footer, services
├── pom.xml
└── secrets.properties   # local only, gitignored (you create this)
```

---

## Getting Started

### Prerequisites

- **Java 22** (the version set in `pom.xml`)
- **Node.js 18+** and npm
- **MySQL 8** running locally
- A **Google Cloud** project with the Drive API enabled and an OAuth client
- A **Microsoft Entra ID (Azure AD)** app registration with the `Files.ReadWrite.All` permission

### 1. Clone the repository

```bash
git clone https://github.com/CodeCraftman2/Project-MultiCloud_Storage_api.git
cd Project-MultiCloud_Storage_api
```

### 2. Configure the database

By default the backend connects to `jdbc:mysql://localhost:3306/multicloud_database` as `root` / `root`. The database is created automatically if it doesn't exist. To use different settings, set these environment variables:

| Variable      | Default                                           |
|---------------|---------------------------------------------------|
| `DB_URL`      | `jdbc:mysql://localhost:3306/multicloud_database?...` |
| `DB_USERNAME` | `root`                                            |
| `DB_PASSWORD` | `root`                                            |

Tables are created and updated automatically by Hibernate (`ddl-auto=update`).

### 3. Set up OAuth credentials

Register these **redirect URIs** with each provider:

| Provider     | Redirect URI                                                         |
|--------------|----------------------------------------------------------------------|
| Google Drive | `http://localhost:8080/multicloudstorageapi/oauth/google/callback`   |
| OneDrive     | `http://localhost:8080/multicloudstorageapi/oauth/onedrive/callback` |

Then create a `secrets.properties` file in the project root. It is gitignored, so never commit it.

```properties
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

MICROSOFT_CLIENT_ID=your-azure-app-client-id
MICROSOFT_CLIENT_SECRET=your-azure-app-client-secret
```

Environment variables with the same names work too. The backend also expects a Google service credentials file at `src/main/resources/google_credentials.json`.

### 4. Run the backend

```bash
# Windows
mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

The API starts at **http://localhost:8080/multicloudstorageapi**.

### 5. Run the frontend

```bash
cd frontend
npm install
npm start
```

Open **http://localhost:4200** in your browser. You'll be sent to the login page.

To create a production build, run `npm run build`. The output goes to `frontend/dist/`.

---

## API Overview

All paths are relative to `http://localhost:8080/multicloudstorageapi`.

### Users: `/users`

| Method | Endpoint             | Description                        |
|--------|----------------------|------------------------------------|
| POST   | `/register`          | Register a new user                |
| POST   | `/login`             | Log in and receive a JWT           |
| GET    | `/currentuser`       | Get the logged-in user             |
| PUT    | `/update/{id}`       | Update the user's profile          |
| GET    | `/myfiles`           | List the user's files              |
| DELETE | `/myfiles/delete`    | Delete one of the user's files     |
| GET    | `/tokens`            | Get the user's connected-drive tokens |
| GET    | `/all`               | List all users                     |

### OAuth: `/oauth`

| Method | Endpoint             | Description                          |
|--------|----------------------|--------------------------------------|
| GET    | `/google`            | Start the Google Drive OAuth flow    |
| GET    | `/google/callback`   | Google OAuth callback                |
| GET    | `/onedrive`          | Start the OneDrive OAuth flow        |
| GET    | `/onedrive/callback` | OneDrive OAuth callback              |

### Files: `/api/files`

| Method | Endpoint                             | Description                  |
|--------|--------------------------------------|------------------------------|
| GET    | `/google/files`                      | List Google Drive files      |
| POST   | `/google/upload`                     | Upload to Google Drive       |
| GET    | `/google/download/{storagePath}`     | Download from Google Drive   |
| DELETE | `/google/delete/{storagePath}`       | Delete from Google Drive     |
| GET    | `/onedrive/files`                    | List OneDrive files          |
| POST   | `/onedrive/upload`                   | Upload to OneDrive           |
| GET    | `/onedrive/download/{storagePath}`   | Download from OneDrive       |
| DELETE | `/onedrive/delete/{storagePath}`     | Delete from OneDrive         |

Protected endpoints require the `Authorization: Bearer <token>` header.

---

## Screenshots

| Spring Boot setup | Register |
|---|---|
| ![Spring Boot setup](springboot%20setup%20-%20Imgur.png) | ![Register page](Register%20page%20-%20Imgur.png) |

| Login | Uploading to the cloud |
|---|---|
| ![Login page](Login%20Page%20-%20Imgur.png) | ![Uploading on cloud](Uploading%20on%20cloud%20-%20Imgur.png) |

| Profile | About |
|---|---|
| ![Profile](Profile%20-%20Imgur.png) | ![About page](About%20page%20-%20Imgur.png) |

| Registered successfully | Upload successful |
|---|---|
| ![Registered successfully](log-Registered%20Successfully%20-%20Imgur.png) | ![Upload successful](Upload%20successfully%20-%20Imgur.png) |

| Error: email already exists |
|---|
| ![Email already exists error](errorlog-email%20exist%20-%20Imgur.png) |

---

## Versions

- **UI version:** [v1.0.0](https://github.com/Springboard-Internship-2024/Multi-cloud-File-Storage-Application_oct_2024/tree/v1.0.0)
- **Backend version:** [v2.0.0](https://github.com/Springboard-Internship-2024/Multi-cloud-File-Storage-Application_oct_2024/tree/v2.0.0)

## Troubleshooting

- **CORS errors in the browser:** make sure the frontend runs on `http://localhost:4200` and the backend on port `8080`.
- **`Access denied for user 'root'`:** set `DB_USERNAME` and `DB_PASSWORD` to match your MySQL install.
- **OAuth `redirect_uri_mismatch`:** the redirect URI registered with Google or Azure must match the one in the table above exactly.
- **Lombok or compile errors on newer JDKs:** build with Java 22, the version the project targets.
