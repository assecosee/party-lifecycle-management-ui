import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyGenericFormComponent } from './survey-generic-form.component';

describe('SurveyGenericFormComponent', () => {
  let component: SurveyGenericFormComponent;
  let fixture: ComponentFixture<SurveyGenericFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyGenericFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SurveyGenericFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
