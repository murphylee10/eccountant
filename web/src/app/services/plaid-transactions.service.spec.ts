import { TestBed } from '@angular/core/testing';

import { PlaidTransactionsService } from './plaid-transactions.service';

describe('PlaidTransactionsService', () => {
  let service: PlaidTransactionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlaidTransactionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
