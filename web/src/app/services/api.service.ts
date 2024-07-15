import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import environment from '@environment';
import { take } from 'rxjs';
import { PlaidTransaction } from '../models/transaction.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private transactionsUrl = '/transactions';

  constructor(private http: HttpClient) {}

  // Custom implementations using httpclient.
  // Necessary for interceptor to attach auth headers.
  private async get<T>(endpoint: string) {
    return new Promise<T>((res, rej) => {
      this.http
        .get<T>(encodeURI(`${environment.api_url}${endpoint}`))
        .pipe(take(1))
        .subscribe({ next: res, error: rej });
    });
  }

  private async post<T>(endpoint: string, body: any) {
    return new Promise<T>((res, rej) => {
      this.http
        .post<T>(encodeURI(`${environment.api_url}${endpoint}`), body)
        .pipe(take(1))
        .subscribe({ next: res, error: rej });
    });
  }

  public async exampleAuth() {
    return this.get<{
      success: boolean;
      msg: string;
    }>('/example/auth').catch((err) => {
      return { success: false, msg: err };
    });
  }

  public async exampleAuthScope() {
    return this.get<{
      success: boolean;
      msg: string;
    }>('/example/authScope').catch((err) => {
      return { success: false, msg: err };
    });
  }

  public async exampleEvent() {
    return this.get<{
      success: boolean;
    }>('/example/event').catch(() => {
      return { success: false };
    });
  }

  public async storeUserId(
    userId: string,
  ): Promise<{ success: boolean; msg: string }> {
    return this.post<{
      success: boolean;
      msg: string;
    }>('/users/register', { userId }).catch((err) => {
      return { success: false, msg: err.msg };
    });
  }

  /* PLAID API */
  getTransactionsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<PlaidTransaction[]> {
    return this.get<PlaidTransaction[]>(
      `${this.transactionsUrl}/date-range?startDate=${startDate}&endDate=${endDate}`,
    );
  }

  getFirstTransaction(): Promise<PlaidTransaction> {
    return this.get<PlaidTransaction>(
      `${this.transactionsUrl}/first-transaction`,
    );
  }

  getLastTransaction(): Promise<PlaidTransaction> {
    return this.get<PlaidTransaction>(
      `${this.transactionsUrl}/last-transaction`,
    );
  }

	fireWebhook() {
		return this.post<any>("/debug/generate_webhook", {});
	}

	ask(query: String): Promise<any> {
    return this.post<any>(`${this.transactionsUrl}/ask`, { query });
	}

}
