import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeriaPageComponent } from './feria-page.component';

describe('FeriaPageComponent', () => {
  let component: FeriaPageComponent;
  let fixture: ComponentFixture<FeriaPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeriaPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeriaPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
