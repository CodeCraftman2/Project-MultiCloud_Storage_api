import { Component, inject } from '@angular/core';
import { IconComponent, IconName } from '../shared/icon.component';
import { API_BASE } from '../services/api.config';
import { StatusService } from '../services/status.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  readonly status = inject(StatusService);
  readonly apiBase = API_BASE;

  readonly features: { icon: IconName; title: string; text: string }[] = [
    { icon: 'cloud', title: 'One dashboard', text: 'See Google Drive and OneDrive side by side, with live storage usage for each.' },
    { icon: 'upload', title: 'Multi-drive upload', text: 'Drag and drop files and send them to one or both drives at the same time.' },
    { icon: 'shield', title: 'Secure by design', text: 'Drives are linked through OAuth 2.0. Your cloud passwords are never stored.' },
    { icon: 'download', title: 'Download & manage', text: 'Browse, search, download and delete files from any connected drive.' },
  ];

  readonly steps: { title: string; text: string }[] = [
    { title: 'Create an account', text: 'Register with a username, email and password, then sign in.' },
    { title: 'Connect your drives', text: 'On the dashboard, choose "Connect" on Google Drive and/or OneDrive and approve access.' },
    { title: 'Upload files', text: 'Pick a destination drive (or both) and drop files onto the upload area.' },
    { title: 'Manage everything', text: 'Open a drive to browse its files, or use My Files to see everything you uploaded.' },
  ];

  readonly faq: { q: string; a: string }[] = [
    { q: 'The status bar says "Backend unreachable"', a: 'Start the Spring Boot server (mvnw spring-boot:run) and make sure MySQL is running. The status updates automatically every 15 seconds, or click it to re-check.' },
    { q: 'I can\'t sign in', a: 'Check your username and password. If the backend is offline, sign-in will fail until it is reachable.' },
    { q: 'A drive shows "Not connected" after I authorized it', a: 'Come back to this tab and press Refresh. Drive status is re-checked whenever the window regains focus.' },
    { q: 'Storage usage shows "unavailable"', a: 'The access token may have expired. Reconnect the drive to issue a fresh token.' },
  ];
}
