import { TestBed, inject } from '@angular/core/testing';

import { IcoPackageService } from './ico-package.service';

describe('IcoPackageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IcoPackageService]
    });
  });

  it('should be created', inject([IcoPackageService], (service: IcoPackageService) => {
    expect(service).toBeTruthy();
  }));
});
