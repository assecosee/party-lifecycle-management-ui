import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartyLifecycleManagementComponent } from './party-lifecycle-management.component';

describe('PartyLifecycleManagementComponent', () => {
  let component: PartyLifecycleManagementComponent;
  let fixture: ComponentFixture<PartyLifecycleManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartyLifecycleManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartyLifecycleManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
