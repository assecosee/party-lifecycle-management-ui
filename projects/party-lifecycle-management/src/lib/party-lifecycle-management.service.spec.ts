import { TestBed } from '@angular/core/testing';

import { PartyLifecycleManagementService } from './party-lifecycle-management.service';

describe('PartyLifecycleManagementService', () => {
  let service: PartyLifecycleManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PartyLifecycleManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
