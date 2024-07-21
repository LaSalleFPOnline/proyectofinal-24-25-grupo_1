import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderFeriaComponent } from './header-feria.component';

describe('HeaderFeriaComponent', () => {
  let component: HeaderFeriaComponent;
  let fixture: ComponentFixture<HeaderFeriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderFeriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderFeriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
