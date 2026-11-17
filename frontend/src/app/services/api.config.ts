/** Base URL of the Spring Boot backend (context path included). */
export const API_BASE = 'http://localhost:8080/multicloudstorageapi';

/** Short host:port form shown in the status bar. */
export const API_HOST = new URL(API_BASE).host;
