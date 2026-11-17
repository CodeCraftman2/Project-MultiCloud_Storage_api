import { Component } from '@angular/core';
import { DriveBrowserComponent } from '../shared/drive-browser.component';

@Component({
  selector: 'app-onedrive',
  standalone: true,
  imports: [DriveBrowserComponent],
  template: `<app-drive-browser driveKey="onedrive" />`,
})
export class OnedriveComponent {}
