import { TestBed } from '@angular/core/testing';

import { PlaidTokenService } from './plaid-token.service';

describe('PlaidService', () => {
  let service: PlaidTokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaidTokenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
