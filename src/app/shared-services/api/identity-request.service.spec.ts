import { TestBed, inject } from '@angular/core/testing';

import { IdentityRequestService } from './identity-request.service';

describe('IdentityRequestService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IdentityRequestService]
    });
  });

  it('should be created', inject([IdentityRequestService], (service: IdentityRequestService) => {
    expect(service).toBeTruthy();
  }));
});
