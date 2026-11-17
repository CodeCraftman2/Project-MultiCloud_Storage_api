import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnedriveComponent } from './onedrive.component';

describe('OnedriveComponent', () => {
  let component: OnedriveComponent;
  let fixture: ComponentFixture<OnedriveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnedriveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnedriveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
