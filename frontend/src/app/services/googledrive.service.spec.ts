import { TestBed } from '@angular/core/testing';

import { GoogledriveService } from './googledrive.service';

describe('GoogledriveService', () => {
  let service: GoogledriveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogledriveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
