import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogledriveComponent } from './googledrive.component';

describe('GoogledriveComponent', () => {
  let component: GoogledriveComponent;
  let fixture: ComponentFixture<GoogledriveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogledriveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogledriveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
