import { TestBed, inject } from '@angular/core/testing';

import { CommissionService } from './commission.service';

describe('CommissionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommissionService]
    });
  });

  it('should be created', inject([CommissionService], (service: CommissionService) => {
    expect(service).toBeTruthy();
  }));
});
