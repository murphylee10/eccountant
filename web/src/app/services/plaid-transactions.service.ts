import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import environment from '@environment';
import { Observable } from 'rxjs';
import { PlaidTransaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class PlaidTransactionsService {
  private transactionsUrl = '/transactions';
  constructor(private http: HttpClient) {}

  getTransactions(): Observable<PlaidTransaction[]> {
    return this.http.get<PlaidTransaction[]>(
      encodeURI(`${environment.api_url}${this.transactionsUrl}/`),
    );
  }
}
