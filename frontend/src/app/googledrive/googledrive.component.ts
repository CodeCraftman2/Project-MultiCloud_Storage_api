import { Component } from '@angular/core';
import { DriveBrowserComponent } from '../shared/drive-browser.component';

@Component({
  selector: 'app-googledrive',
  standalone: true,
  imports: [DriveBrowserComponent],
  template: `<app-drive-browser driveKey="google" />`,
})
export class GoogledriveComponent {}
